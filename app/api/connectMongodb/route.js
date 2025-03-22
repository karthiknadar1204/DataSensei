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

    // Record initial sync status for each collection
    const syncPromises = allCollectionData.map(collection => 
      db.insert(tableSyncStatus).values({
        connectionId: newConnection.id,
        tableName: collection.collectionName,
        lastSyncTimestamp: new Date(),
        lastSyncRowCount: collection.data.length,
        dbType: 'mongodb',
      })
    );

    await Promise.all(syncPromises);
    console.log('Initial sync status recorded for all collections');

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