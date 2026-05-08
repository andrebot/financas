import { timestamp } from 'drizzle-orm/pg-core';

export const timestampColumns = {
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt'),
};
