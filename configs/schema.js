import { pgTable, text, integer, serial, timestamp, json,varchar,index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.clerk_id),
  connectionId: integer('connection_id').references(() => dbConnections.id),
  conversation: json('conversation').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  clerk_id: text('clerk_id').unique(),
  createdAt: timestamp('created_at').defaultNow()
});

export const dbConnections = pgTable('db_connections', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 256 }).references(() => users.clerk_id).notNull(),
  connectionName: varchar('connection_name', { length: 256 }).notNull(),
  postgresUrl: text('postgres_url'),
  mongoUrl: text('mongo_url'),
  dbType: varchar('db_type', { length: 50 }).notNull(), // 'postgresql' or 'mongodb'
  tableSchema: json('table_schema').notNull(),
  tableData: json('table_data').notNull(),     
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId)
}))

export const tableSyncStatus = pgTable('table_sync_status', {
  id: serial('id').primaryKey(),
  connectionId: integer('connection_id').references(() => dbConnections.id).notNull(),
  tableName: varchar('table_name', { length: 256 }).notNull(),
  lastSyncTimestamp: timestamp('last_sync_timestamp').notNull(),
  lastSyncRowCount: integer('last_sync_row_count').notNull(),
  dbType: varchar('db_type', { length: 50 }).notNull(), // 'postgresql' or 'mongodb'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  connectionTableIdx: index('connection_table_idx').on(table.connectionId, table.tableName)
}));

export const chatsRelations = relations(chats, ({ one }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.clerk_id],
  }),
}));
