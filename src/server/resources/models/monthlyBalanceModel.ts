import { relations } from 'drizzle-orm';
import {
  pgTable, serial, integer, numeric,
} from 'drizzle-orm/pg-core';
import { accounts } from './accountModel';
import { timestampColumns } from './columHelpers';

export const monthlyBalances = pgTable('monthlyBalances', {
  id: serial('id').primaryKey(),
  accountId: integer('accountId').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  openingBalance: numeric({ precision: 14, scale: 2 }).notNull(),
  closingBalance: numeric({ precision: 14, scale: 2 }).notNull(),
  totalIn: numeric({ precision: 14, scale: 2 }).notNull(),
  totalOut: numeric({ precision: 14, scale: 2 }).notNull(),
  ...timestampColumns,
});

export const monthlyBalanceRelations = relations(monthlyBalances, ({ one }) => ({
  account: one(accounts, {
    fields: [monthlyBalances.accountId],
    references: [accounts.id],
  }),
}));
