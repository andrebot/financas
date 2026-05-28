import { timestamp } from 'drizzle-orm/pg-core';

/* eslint-disable import/prefer-default-export */

export const timestampColumns = {
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt'),
};
