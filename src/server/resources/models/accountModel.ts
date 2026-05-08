import { integer, pgTable, serial, text, numeric } from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './userModel';
import { timestampColumns } from './columHelpers';
import { transactions } from './transactionModel';
import { regExpNameWithNumbers, regExpOnlyNumbers } from '../../../client/utils/validators';

export const cards = pgTable('cards', {
  id: serial('id').primaryKey(),
  number: text('number').notNull(),
  expirationDate: text('expirationDate').notNull(),
  accountId: integer('accountId').notNull().references(() => accounts.id),
  ...timestampColumns,
});

export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  currency: text('currency').notNull(),
  agency: text('agency').notNull(),
  accountNumber: text('accountNumber').notNull(),
  initialBalance: numeric({ precision: 14, scale: 2 }).notNull(),
  userId: integer('userId').notNull().references(() => users.id),
  ...timestampColumns,
});

export const cardRelations = relations(cards, ({ one }) => ({
  account: one(accounts, {
    fields: [cards.accountId],
    references: [accounts.id],
  }),
}));

export const accountRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  cards: many(cards),
  transactions: many(transactions),
}));

export const accountSchema = z.union([
  createInsertSchema(accounts, {
    name: z.string().min(1).regex(regExpNameWithNumbers),
    agency: z.string().min(1).regex(regExpOnlyNumbers),
    accountNumber: z.string().min(1).regex(regExpOnlyNumbers),
    currency: z.string().min(1),
    userId: z.string().min(1),
    initialBalance: z.number().min(0),
    createdAt: z.date().default(new Date()),
    updatedAt: z.date().optional(),
  }),
  createSelectSchema(accounts, {
    id: z.string().optional(),
    name: z.string().optional(),
    agency: z.string().optional(),
    accountNumber: z.string().optional(),
    currency: z.string().optional(),
    userId: z.string().optional(),
    initialBalance: z.number().optional(),
  }),
]);

export type Account = z.infer<typeof accountSchema>;
export type AccountInsert = InferInsertModel<typeof accounts>;
export type AccountSelect = InferSelectModel<typeof accounts>;

