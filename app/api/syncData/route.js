import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { syncNewData } from '@/app/actions/syncData';
import { db } from '@/configs/db';
import { dbConnections } from '@/configs/schema';
import { eq } from 'drizzle-orm';

export async function POST(request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId } = await request.json();
    
    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
    }
    
    // Verify the connection belongs to the user
    const connection = await db.select()
      .from(dbConnections)
      .where(eq(dbConnections.id, connectionId))
      .where(eq(dbConnections.userId, user.id));
      
    if (!connection || connection.length === 0) {
      return NextResponse.json({ error: 'Connection not found or unauthorized' }, { status: 404 });
    }
    
    const result = await syncNewData(connectionId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in sync API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 