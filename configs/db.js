import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema"

const sql = neon("postgresql://karthiknadar1204:Fvph9DyfVm2L@ep-restless-credit-a1c7489o-pooler.ap-southeast-1.aws.neon.tech/db_chat?sslmode=require");
export const db = drizzle(sql,{schema});

// const result = await db.select().from(...);