import { currentUser } from '@clerk/nextjs/server'
import { dbConnections } from '@/configs/schema'
import { NextResponse } from 'next/server'
import { db } from '@/configs/db'
import { eq } from 'drizzle-orm'

export async function GET(req, res) {
    const user = await currentUser()
    const connections = await db.select().from(dbConnections).where(eq(dbConnections.userId, user.id))
    return NextResponse.json(connections)
}