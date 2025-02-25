import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { dbConnections } from '@/configs/schema';
import { currentUser } from '@clerk/nextjs/server';
import { connectToMongoDB } from '@/lib/utils/mongoDb';

export async function POST(request) {
  try {
    const user = await currentUser();
    const { mongoUrl, connectionName } = await request.json();

    if (!mongoUrl || !connectionName) {
      return NextResponse.json(
        { error: 'MongoDB URL and connection name are required' },
        { status: 400 }
      );
    }

    const allCollectionData = await connectToMongoDB(mongoUrl);
    console.log("allCollectionData",allCollectionData);

    const [newConnection] = await db.insert(dbConnections).values({
      userId: user.id,
      connectionName: connectionName,
      mongoUrl: mongoUrl,
      dbType: 'mongodb',
      tableSchema: JSON.stringify(allCollectionData.map(t => ({
        tableName: t.collectionName,
        columns: t.schema
      }))),
      tableData: JSON.stringify(allCollectionData.map(t => ({
        tableName: t.collectionName,
        data: t.data
      })))
    }).returning();

    return NextResponse.json({ 
      id: newConnection.id,
      tables: allCollectionData 
    });

  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 