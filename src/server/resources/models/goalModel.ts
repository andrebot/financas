import {
  pgTable, serial, text, integer, timestamp, boolean, AnyPgColumn, numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './userModel';
import { timestampColumns } from './columHelpers';

export const goals = pgTable('goals', {
  id: serial().primaryKey(),
  name: text().notNull(),
  value: integer().notNull(),
  savedValue: numeric({ precision: 14, scale: 2 }).notNull(),
  dueDate: timestamp().notNull(),
  archived: boolean().default(false),
  userId: integer().notNull().references((): AnyPgColumn => users.id),
  ...timestampColumns,
});

export const goalRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));
