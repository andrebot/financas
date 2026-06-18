import {
  pgTable, serial, text, integer, timestamp, numeric, pgEnum, boolean, primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './userModel';
import { accounts } from './accountModel';
import { goals } from './goalModel';
import { transactions, investmentTypes } from './transactionModel';
import { timestampColumns } from './columHelpers';

export const rateTypes = pgEnum('rateTypes', [
  'pre',
  'cdi',
  'ipca',
  'igpm',
  'selic',
  'other',
]);

export const investments = pgTable('investments', {
  id: serial().primaryKey(),
  name: text().notNull(),
  investmentType: investmentTypes().notNull(),
  ticker: text(),
  accountId: integer().notNull().references(() => accounts.id),
  userId: integer().notNull().references(() => users.id),
  quantity: numeric({ precision: 14, scale: 8 }),
  averagePrice: numeric({ precision: 14, scale: 2 }),
  totalInvested: numeric({ precision: 14, scale: 2 }).notNull().default('0'),
  dueDate: timestamp(),
  rateType: rateTypes(),
  rateValue: numeric({ precision: 8, scale: 4 }),
  issuer: text(),
  archived: boolean().notNull().default(false),
  ...timestampColumns,
});

export const transactionToInvestments = pgTable('transactionToInvestments', {
  transactionId: integer().notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  investmentId: integer().notNull().references(() => investments.id, { onDelete: 'cascade' }),
  quantity: numeric({ precision: 14, scale: 8 }),
  unitPrice: numeric({ precision: 14, scale: 2 }),
}, (table) => ([
  primaryKey({ columns: [table.transactionId, table.investmentId] }),
]));

export const investmentToGoals = pgTable('investmentToGoals', {
  investmentId: integer().notNull().references(() => investments.id, { onDelete: 'cascade' }),
  goalId: integer().notNull().references(() => goals.id, { onDelete: 'cascade' }),
  percentage: numeric({ precision: 14, scale: 2 }).notNull(),
}, (table) => ([
  primaryKey({ columns: [table.investmentId, table.goalId] }),
]));

export const investmentRelations = relations(investments, ({ one, many }) => ({
  account: one(accounts, {
    fields: [investments.accountId],
    references: [accounts.id],
  }),
  user: one(users, {
    fields: [investments.userId],
    references: [users.id],
  }),
  transactions: many(transactionToInvestments),
  goals: many(investmentToGoals),
}));

export const transactionToInvestmentsRelations = relations(transactionToInvestments, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionToInvestments.transactionId],
    references: [transactions.id],
  }),
  investment: one(investments, {
    fields: [transactionToInvestments.investmentId],
    references: [investments.id],
  }),
}));

export const investmentToGoalsRelations = relations(investmentToGoals, ({ one }) => ({
  investment: one(investments, {
    fields: [investmentToGoals.investmentId],
    references: [investments.id],
  }),
  goal: one(goals, {
    fields: [investmentToGoals.goalId],
    references: [goals.id],
  }),
}));
