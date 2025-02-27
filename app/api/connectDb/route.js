import { Client } from 'pg';
import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { dbConnections } from '@/configs/schema';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request) {
  let client;
  try {
    const user = await currentUser();
    const { postgresUrl, connectionName, dbType } = await request.json();

    if (!postgresUrl || !connectionName) {
      return NextResponse.json(
        { error: 'PostgreSQL URL and connection name are required' },
        { status: 400 }
      );
    }

    // Parse the connection string to determine if it includes SSL parameters
    const hasSSLParam = postgresUrl.includes('sslmode=');
    
    // Create connection options - trying a more forceful approach to disable SSL checking
    let connectionOptions = { 
      connectionString: postgresUrl,
      statement_timeout: 30000,
      query_timeout: 30000
    };
    
    // Only add SSL options if not already specified in the URL
    if (!hasSSLParam) {
      // Set SSL mode to 'no-verify' - this is the most permissive setting
      if (postgresUrl.includes('?')) {
        connectionOptions.connectionString = `${postgresUrl}&sslmode=no-verify`;
      } else {
        connectionOptions.connectionString = `${postgresUrl}?sslmode=no-verify`;
      }
      
      // Add SSL configuration object as a fallback
      connectionOptions.ssl = {
        rejectUnauthorized: false
      };
    }

    console.log('Attempting to connect with modified connection string...');
    console.log('SSL parameters configured:', !hasSSLParam);
    
    client = new Client(connectionOptions);
    
    // Set a node environment variable to disable node's certificate checking
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    try {
      await client.connect();
      console.log('Successfully connected to PostgreSQL database');
    } catch (connectError) {
      console.error('Initial connection failed:', connectError);
      
      // If first attempt fails, try with different SSL settings
      console.log('Trying alternative connection method...');
      await client.end();
      
      // Try with direct SSL settings approach
      connectionOptions = { 
        connectionString: postgresUrl.split('?')[0], // Remove any existing params
        statement_timeout: 30000,
        query_timeout: 30000,
        ssl: {
          rejectUnauthorized: false
        }
      };
      
      client = new Client(connectionOptions);
      await client.connect();
      console.log('Connected with alternative method');
    }

    // Restore the environment variable after connection
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
    `);

    const tables = tablesResult.rows;
    console.log("Retrieved tables:", tables.length);
    
    const CHUNK_SIZE = 5;
    const tableChunks = chunkArray(tables, CHUNK_SIZE);
    console.log("Processing tables in chunks of:", CHUNK_SIZE);
    
    const allTableData = [];

    for (const chunk of tableChunks) {
      const chunkPromises = chunk.map(async (table) => {
        const tableName = table.table_name;
        console.log(`Processing table: ${tableName}`);
        
        try {
          const [columnsResult, dataResult] = await Promise.all([
            client.query(`
              SELECT column_name, data_type 
              FROM information_schema.columns 
              WHERE table_schema='public' 
              AND table_name=$1
            `, [tableName]),
            
            client.query(`
              SELECT * FROM "${tableName}" LIMIT 1000
            `)
          ]);
          
          console.log(`Table ${tableName}: Found ${columnsResult.rows.length} columns and ${dataResult.rows.length} rows`);
          
          return {
            tableName,
            columns: columnsResult.rows,
            data: dataResult.rows
          };
        } catch (tableError) {
          console.error(`Error processing table ${tableName}:`, tableError);
          return {
            tableName,
            columns: [],
            data: [],
            error: tableError.message
          };
        }
      });
      
      const chunkResults = await Promise.all(chunkPromises);
      allTableData.push(...chunkResults);
    }

    console.log('Closing database connection...');
    await client.end();
    console.log('Database connection closed');

    console.log('Saving connection information to application database...');
    const [newConnection] = await db.insert(dbConnections).values({
      userId: user.id,
      connectionName: connectionName,
      postgresUrl: postgresUrl,
      dbType: dbType,
      tableSchema: JSON.stringify(allTableData.map(t => ({
        tableName: t.tableName,
        columns: t.columns
      }))),
      tableData: JSON.stringify(allTableData.map(t => ({
        tableName: t.tableName,
        data: t.data
      })))
    }).returning();

    console.log('Connection saved successfully with ID:', newConnection.id);
    
    // Reset NODE_TLS_REJECT_UNAUTHORIZED to make sure we don't affect other operations
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    
    return NextResponse.json({ 
      id: newConnection.id,
      tables: allTableData 
    });

  } catch (error) {
    console.error('Database connection error:', error);
    
    // Reset NODE_TLS_REJECT_UNAUTHORIZED in case of error
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    
    // More descriptive error response
    return NextResponse.json(
      { 
        error: error.message,
        code: error.code,
        details: 'Check that your PostgreSQL URL is correct and the server is accessible'
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        console.log('Ensuring database connection is closed...');
        await client.end();
        console.log('PostgreSQL client disconnected');
      } catch (e) {
        console.error('Error closing client:', e);
      }
    }
    
    // Final safety reset of NODE_TLS_REJECT_UNAUTHORIZED
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
  }
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}