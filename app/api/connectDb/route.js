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

    client = new Client({ 
      connectionString: postgresUrl,
      statement_timeout: 30000,
      query_timeout: 30000
    });
    await client.connect();


    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
    `);

    const tables = tablesResult.rows;
    console.log("tables", tables)
    const CHUNK_SIZE = 5;
    const tableChunks = chunkArray(tables, CHUNK_SIZE);
    console.log("tableChunks", tableChunks)
    const allTableData = [];


    for (const chunk of tableChunks) {
      const chunkPromises = chunk.map(async (table) => {
        const tableName = table.table_name;
        // console.log("tableName", tableName)
        const [columnsResult, dataResult] = await Promise.all([
          client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema='public' 
            AND table_name=$1
          `, [tableName]),
          
          client.query(`
            SELECT * FROM "${tableName}"
          `)
        ]);
        // console.log("columnsResult", columnsResult)
        // console.log("dataResult", dataResult)
        return {
          tableName,
          columns: columnsResult.rows,
          data: dataResult.rows
        };
      });
      
      const chunkResults = await Promise.all(chunkPromises);
      allTableData.push(...chunkResults);
    }

    await client.end();


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

    return NextResponse.json({ 
      id: newConnection.id,
      tables: allTableData 
    });

  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (e) {
        console.error('Error closing client:', e);
      }
    }
  }
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}