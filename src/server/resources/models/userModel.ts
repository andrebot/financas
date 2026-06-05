import {
  pgTable, serial, text, pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { timestampColumns } from './columHelpers';
import { accounts } from './accountModel';
import { goals } from './goalModel';
import { budgets } from './budgetModel';

export const roles = pgEnum('roles', ['admin', 'user']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  role: roles('role').default('user').notNull(),
  password: text('password').notNull(),
  ...timestampColumns,
});

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  goals: many(goals),
  budgets: many(budgets),
}));
