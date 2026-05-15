import {
  pgTable, serial, text, integer, timestamp, primaryKey, numeric, pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './userModel';
import { categories } from './categoryModel';
import { transactions } from './transactionModel';
import { timestampColumns } from './columHelpers';

export const budgetTypes = pgEnum('budgetTypes', [
  'annualy',
  'quarterly',
  'monthly',
  'weekly',
  'daily',
]);

export const budgets = pgTable('budgets', {
  id: serial().primaryKey(),
  name: text().notNull(),
  value: numeric({ precision: 14, scale: 2 }).notNull(),
  type: budgetTypes().notNull(),
  startDate: timestamp().notNull(),
  endDate: timestamp().notNull(),
  userId: integer().notNull().references(() => users.id),
  ...timestampColumns,
});

export const budgetUsage = pgTable('budgetUsage', {
  budgetId: integer().notNull().references(() => budgets.id),
  transactionId: integer().notNull().references(() => transactions.id),
  date: timestamp().notNull(),
  valueUsed: numeric({ precision: 14, scale: 2 }).notNull(),
  ...timestampColumns,
}, (table) => ([
  primaryKey({ columns: [table.budgetId, table.transactionId] }),
]));

export const budgetToCategories = pgTable('budgetToCategories', {
  budgetId: integer().notNull().references(() => budgets.id),
  categoryId: integer().notNull().references(() => categories.id),
  ...timestampColumns,
}, (table) => ([
  primaryKey({ columns: [table.budgetId, table.categoryId] }),
]));

export const budgetRelations = relations(budgets, ({ one, many }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
  categories: many(budgetToCategories),
}));

export const budgetToCategoriesRelations = relations(budgetToCategories, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetToCategories.budgetId],
    references: [budgets.id],
  }),
  category: one(categories, {
    fields: [budgetToCategories.categoryId],
    references: [categories.id],
  }),
}));

export const budgetUsageRelations = relations(budgetUsage, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetUsage.budgetId],
    references: [budgets.id],
  }),
  transaction: one(transactions, {
    fields: [budgetUsage.transactionId],
    references: [transactions.id],
  }),
}));
