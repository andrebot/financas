import {
  integer, pgTable, serial, text, AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './userModel';
import { timestampColumns } from './columHelpers';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  userId: integer('userId').notNull().references(() => users.id),
  parentCategoryId: integer('parentCategoryId').references((): AnyPgColumn => categories.id),
  ...timestampColumns,
});

export const categoryRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  parentCategory: one(categories, {
    fields: [categories.parentCategoryId],
    references: [categories.id],
  }),
  subCategories: many(categories),
}));
