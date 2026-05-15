import { AsyncLocalStorage } from 'async_hooks';
import { db } from './databaseConnection';

type DbClient = typeof db;

const transactionContext = new AsyncLocalStorage<DbClient>();

/**
 * Runs a function inside a database transaction.
 * All repo operations that use getDb() within the callback will automatically
 * participate in the transaction. On error, everything is rolled back.
 *
 * @param fn - The function to run inside the transaction.
 * @returns The result of the function.
 */
export function withTransaction<T>(fn: () => Promise<T>): Promise<T> {
  return db.transaction((tx) => transactionContext.run(tx as unknown as DbClient, fn));
}

/**
 * Returns the active transaction client if one exists in the current async context,
 * otherwise returns the global database connection.
 *
 * @returns The active database client.
 */
export function getDb(): DbClient {
  return transactionContext.getStore() ?? db;
}
