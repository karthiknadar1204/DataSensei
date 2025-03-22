"use server";

import { Client } from 'pg';
import { MongoClient } from 'mongodb';
import { db } from '@/configs/db';
import { tableSyncStatus, dbConnections } from '@/configs/schema';
import { eq, and } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { embeddings } from './chat';
import { chunkTableData } from '@/lib/utils/tokenManagement';

export async function syncNewData(connectionId) {
  console.log(`Starting incremental sync for connection ID: ${connectionId}`);
  const user = await currentUser();
  if (!user) return { success: false, error: "User not authenticated" };

  try {
    // Get connection details
    const [connection] = await db.select()
      .from(dbConnections)
      .where(eq(dbConnections.id, connectionId));

    if (!connection) {
      return { success: false, error: "Connection not found" };
    }

    // Get sync status for all tables in this connection
    const syncStatus = await db.select()
      .from(tableSyncStatus)
      .where(eq(tableSyncStatus.connectionId, connectionId));

    // Create a map for quick lookup
    const syncStatusMap = {};
    syncStatus.forEach(status => {
      syncStatusMap[status.tableName] = status;
    });

    // Parse the table schema from the connection if it's a string, otherwise use it directly
    let tableSchema;
    try {
      tableSchema = typeof connection.tableSchema === 'string' 
        ? JSON.parse(connection.tableSchema) 
        : connection.tableSchema;
    } catch (error) {
      console.log('Table schema is already an object, using directly');
      tableSchema = connection.tableSchema;
    }
    
    // Process based on database type
    if (connection.dbType === 'postgresql') {
      return await syncPostgresData(connection, tableSchema, syncStatusMap);
    } else if (connection.dbType === 'mongodb') {
      return await syncMongoData(connection, tableSchema, syncStatusMap);
    } else {
      return { success: false, error: "Unsupported database type" };
    }
  } catch (error) {
    console.error("Error syncing new data:", error);
    return { success: false, error: error.message };
  }
}

async function syncPostgresData(connection, tableSchema, syncStatusMap) {
  let client;
  const newData = [];
  
  try {
    // Parse the connection string to determine if it includes SSL parameters
    const postgresUrl = connection.postgresUrl;
    const hasSSLParam = postgresUrl.includes('sslmode=');
    
    // Create connection options
    let connectionOptions = { 
      connectionString: postgresUrl,
      statement_timeout: 30000,
      query_timeout: 30000
    };
    
    // Only add SSL options if not already specified in the URL
    if (!hasSSLParam) {
      // Set SSL mode to 'no-verify'
      if (postgresUrl.includes('?')) {
        connectionOptions.connectionString = `${postgresUrl}&sslmode=no-verify`;
      } else {
        connectionOptions.connectionString = `${postgresUrl}?sslmode=no-verify`;
      }
      
      connectionOptions.ssl = {
        rejectUnauthorized: false
      };
    }

    console.log('Connecting to PostgreSQL database...');
    client = new Client(connectionOptions);
    await client.connect();
    console.log('Connected to PostgreSQL database');

    let tablesUpdated = 0;
    let rowsAdded = 0;

    // Process each table
    for (const table of tableSchema) {
      const tableName = table.tableName;
      const syncStatus = syncStatusMap[tableName];
      
      if (!syncStatus) {
        console.log(`No sync status found for table ${tableName}, skipping`);
        continue;
      }

      console.log(`Processing table: ${tableName}`);
      
      // Get column information
      const columnsResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema='public' 
        AND table_name=$1
      `, [tableName]);
      
      // Find a timestamp column for incremental sync
      const timestampColumn = findTimestampColumn(columnsResult.rows);
      
      let newRows = [];
      
      if (timestampColumn) {
        // Use timestamp-based sync
        console.log(`Using timestamp column ${timestampColumn} for incremental sync`);
        
        const lastSyncTime = new Date(syncStatus.lastSyncTimestamp).toISOString();
        
        const query = `
          SELECT * FROM "${tableName}" 
          WHERE "${timestampColumn}" > $1
          LIMIT 1000
        `;
        
        const result = await client.query(query, [lastSyncTime]);
        newRows = result.rows;
        console.log(`Found ${newRows.length} new rows in table ${tableName} since ${lastSyncTime}`);
      } else {
        // Use offset-based sync
        console.log(`No timestamp column found for table ${tableName}, using offset-based sync`);
        
        const query = `
          SELECT * FROM "${tableName}" 
          LIMIT 1000 OFFSET $1
        `;
        
        const result = await client.query(query, [syncStatus.lastSyncRowCount]);
        newRows = result.rows;
        console.log(`Found ${newRows.length} new rows in table ${tableName} using offset ${syncStatus.lastSyncRowCount}`);
      }
      
      if (newRows.length > 0) {
        tablesUpdated++;
        rowsAdded += newRows.length;
        
        // Add to newData for embedding - include columns information
        newData.push({
          tableName,
          data: newRows,
          columns: columnsResult.rows
        });
        
        // Update sync status
        await db.update(tableSyncStatus)
          .set({
            lastSyncTimestamp: new Date(),
            lastSyncRowCount: syncStatus.lastSyncRowCount + newRows.length
          })
          .where(and(
            eq(tableSyncStatus.connectionId, connection.id),
            eq(tableSyncStatus.tableName, tableName)
          ));
        
        console.log(`Updated sync status for table ${tableName}`);
      }
    }
    
    // Process embeddings for new data if any
    if (newData.length > 0) {
      console.log(`Processing embeddings for ${newData.length} tables with new data`);
      
      await embeddings({
        id: connection.id,
        connectionName: connection.connectionName,
        dbType: connection.dbType,
        tables: newData
      });
      
      console.log('Embeddings processed successfully');
    }
    
    return {
      success: true,
      tablesUpdated,
      rowsAdded
    };
  } catch (error) {
    console.error('Error in syncPostgresData:', error);
    return { success: false, error: error.message };
  } finally {
    if (client) {
      try {
        await client.end();
        console.log('PostgreSQL client disconnected');
      } catch (e) {
        console.error('Error closing client:', e);
      }
    }
  }
}

async function syncMongoData(connection, tableSchema, syncStatusMap) {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(connection.mongoUrl);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const dbName = new URL(connection.mongoUrl).pathname.substring(1) || 'test';
    const database = client.db(dbName);
    
    let collectionsUpdated = 0;
    let documentsAdded = 0;
    const newData = [];
    
    // Process each collection
    for (const collection of tableSchema) {
      const collectionName = collection.tableName;
      const syncStatus = syncStatusMap[collectionName];
      
      if (!syncStatus) {
        console.log(`No sync status found for collection ${collectionName}, skipping`);
        continue;
      }
      
      console.log(`Processing collection: ${collectionName}`);
      const mongoCollection = database.collection(collectionName);
      
      // Find a timestamp field for incremental sync
      const timestampField = findMongoTimestampField(collection.columns);
      
      let newDocuments = [];
      
      if (timestampField) {
        // Use timestamp-based sync
        console.log(`Using timestamp field ${timestampField} for incremental sync`);
        
        const lastSyncTime = new Date(syncStatus.lastSyncTimestamp);
        
        const query = { [timestampField]: { $gt: lastSyncTime } };
        newDocuments = await mongoCollection.find(query).limit(1000).toArray();
        
        console.log(`Found ${newDocuments.length} new documents in collection ${collectionName} since ${lastSyncTime}`);
      } else {
        // Use offset-based sync
        console.log(`No timestamp field found for collection ${collectionName}, using offset-based sync`);
        
        newDocuments = await mongoCollection.find({})
          .skip(syncStatus.lastSyncRowCount)
          .limit(1000)
          .toArray();
        
        console.log(`Found ${newDocuments.length} new documents in collection ${collectionName} using offset ${syncStatus.lastSyncRowCount}`);
      }
      
      if (newDocuments.length > 0) {
        collectionsUpdated++;
        documentsAdded += newDocuments.length;
        
        // Add to newData for embedding
        newData.push({
          collectionName,
          data: newDocuments,
          schema: inferMongoSchema(newDocuments)
        });
        
        // Update sync status
        await db.update(tableSyncStatus)
          .set({
            lastSyncTimestamp: new Date(),
            lastSyncRowCount: syncStatus.lastSyncRowCount + newDocuments.length
          })
          .where(and(
            eq(tableSyncStatus.connectionId, connection.id),
            eq(tableSyncStatus.tableName, collectionName)
          ));
        
        console.log(`Updated sync status for collection ${collectionName}`);
      }
    }
    
    // Process embeddings for new data if any
    if (newData.length > 0) {
      console.log(`Processing embeddings for ${newData.length} collections with new data`);
      
      await embeddings({
        id: connection.id,
        connectionName: connection.connectionName,
        dbType: connection.dbType,
        collections: newData
      });
      
      console.log('Embeddings processed successfully');
    }
    
    return {
      success: true,
      collectionsUpdated,
      documentsAdded
    };
  } catch (error) {
    console.error('Error in syncMongoData:', error);
    return { success: false, error: error.message };
  } finally {
    if (client) {
      try {
        await client.close();
        console.log('MongoDB client disconnected');
      } catch (e) {
        console.error('Error closing client:', e);
      }
    }
  }
}

// Helper function to find a timestamp column in PostgreSQL
function findTimestampColumn(columns) {
  const timestampTypes = ['timestamp', 'timestamptz', 'date', 'datetime'];
  const commonNames = ['created_at', 'updated_at', 'timestamp', 'date', 'created', 'modified'];
  
  // First try to find columns with common timestamp names
  for (const column of columns) {
    if (commonNames.includes(column.column_name.toLowerCase()) && 
        timestampTypes.some(type => column.data_type.toLowerCase().includes(type))) {
      return column.column_name;
    }
  }
  
  // Then try any column with timestamp type
  for (const column of columns) {
    if (timestampTypes.some(type => column.data_type.toLowerCase().includes(type))) {
      return column.column_name;
    }
  }
  
  return null;
}

// Helper function to find a timestamp field in MongoDB
function findMongoTimestampField(columns) {
  const commonNames = ['createdAt', 'created_at', 'updatedAt', 'updated_at', 'timestamp', 'date'];
  
  for (const column of columns) {
    if (commonNames.includes(column.column_name) || 
        column.column_name.toLowerCase().includes('date') || 
        column.column_name.toLowerCase().includes('time')) {
      return column.column_name;
    }
  }
  
  return null;
}

// Helper function to infer MongoDB schema
function inferMongoSchema(documents) {
  const schema = [];
  if (documents.length === 0) return schema;
  
  const sampleDoc = documents[0];
  for (const [key, value] of Object.entries(sampleDoc)) {
    schema.push({
      column_name: key,
      data_type: typeof value === 'object' ? 
        (Array.isArray(value) ? 'array' : 'object') : 
        typeof value
    });
  }
  
  return schema;
} 