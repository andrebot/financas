import {
  pgTable, serial, text, integer, timestamp, numeric, pgEnum, primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './userModel';
import { categories } from './categoryModel';
import { timestampColumns } from './columHelpers';
import { accounts } from './accountModel';
import { goals } from './goalModel';

export const transactionTypes = pgEnum('transactionTypes', [
  'withdraw',
  'transferIn',
  'transferOut',
  'deposit',
  'bankSlip',
  'cardPurchase',
  'cardRefund',
  'payment',
  'investmentBuy',
  'investmentSell',
  'investmentDividend',
  'investmentInterest',
]);

export const investmentTypes = pgEnum('investmentTypes', [
  'cdb',
  'lci',
  'lca',
  'stock',
  'fund',
  'cra',
  'cri',
  'debenture',
  'currency',
  'lc',
  'lf',
  'fii',
  'tresury',
  'mutual_fund',
  'crypto',
  'real_estate',
  'other',
]);

export const transactions = pgTable('transactions', {
  id: serial().primaryKey(),
  name: text().notNull(),
  categoryId: integer().references(() => categories.id),
  accountId: integer().notNull().references(() => accounts.id),
  type: transactionTypes().notNull(),
  date: timestamp().notNull(),
  value: numeric({ precision: 14, scale: 2 }).notNull(),
  investmentType: investmentTypes(),
  userId: integer().notNull().references(() => users.id),
  ...timestampColumns,
});

export const transactionToGoals = pgTable('transactionToGoals', {
  transactionId: integer().notNull().references(() => transactions.id),
  goalId: integer().notNull().references(() => goals.id),
  percentage: numeric({ precision: 14, scale: 2 }).notNull(),
  ...timestampColumns,
}, (table) => ([
  primaryKey({ columns: [table.transactionId, table.goalId] }),
]));

export const transactionRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  goals: many(transactionToGoals),
}));
