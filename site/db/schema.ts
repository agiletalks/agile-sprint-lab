// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const sessions = sqliteTable('sessions', {
  code: text('code').primaryKey(), title: text('title').notNull(),
  state: text('state').notNull(), accepting: integer('accepting').notNull().default(1),
  created: integer('created').notNull(),
});
export const posters = sqliteTable('posters', {
  id: text('id').primaryKey(), code: text('code').notNull().references(() => sessions.code),
  team: integer('team').notNull(), title: text('title').notNull(),
  key: text('key').notNull(), mime: text('mime').notNull(),
  status: text('status').notNull(), created: integer('created').notNull(),
});
