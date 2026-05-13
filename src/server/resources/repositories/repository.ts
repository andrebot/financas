import { and, eq, InferInsertModel } from 'drizzle-orm';
import { Logger } from 'winston';
import { createLogger } from '../../utils/logger';
import { getAutorizationDatabaseContext } from '../../utils/authorization';
import { getDb } from '../../utils/transaction';
import { IRepository, Table } from '../../types';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;

/**
 * Converts ISO date strings in an entity to Date objects so that Drizzle's
 * timestamp column mapper (which calls `.toISOString()`) receives the expected type.
 * JSON-serialised request bodies always carry dates as strings; this normalises them.
 *
 * @param entity - The entity to preprocess.
 * @returns A shallow copy of the entity with string dates replaced by Date objects.
 */
function coerceDates<T>(entity: T): T {
  if (!entity || typeof entity !== 'object') {
    return entity;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(entity as object)) {
    result[key] = typeof value === 'string' && ISO_DATE_REGEX.test(value)
      ? new Date(value)
      : value;
  }

  return result as T;
}

/**
 * Creates a generic repository with standard CRUD operations for a Drizzle table.
 * All operations are scoped to the current authorization context and participate
 * in any active database transaction via {@link getDb}.
 *
 * @template T - The Drizzle table type.
 * @template K - The domain entity type inferred from the table.
 * @param table - The Drizzle table schema object.
 * @param modelName - Human-readable label used in log messages and error strings.
 * @param clogger - Optional pre-created logger; a new one is created if omitted.
 * @returns An {@link IRepository} instance bound to the given table.
 */
export default function Repository<T extends Table, K>(table: T, modelName: string, clogger?: Logger): IRepository<T, K> {
  type InsertEntity = InferInsertModel<typeof table>;

  const logger = clogger || createLogger(`Repository:${modelName}`);

  /**
   * Finds a record by its primary key, scoped to the current authorization context.
   *
   * @throws {Error} - If the id is null or undefined.
   *
   * @param id - The primary key value to look up.
   * @returns The matching record, or null if not found.
   */
  async function findById(id: number): Promise<K | null> {
    if (id === null || id === undefined) {
      logger.error(`Invalid id: ${id}`);

      throw new Error(`Invalid id: ${id}`);
    }

    logger.info(`Finding ${modelName} by id: ${id}`);

    const rows = await getDb()
      .select()
      .from(table as never)
      .where(
        and(
          eq(table.id, id),
          getAutorizationDatabaseContext(table),
        ),
      )
      .limit(1);

    if (rows.length === 0) {
      logger.info(`${modelName} not found by id: ${id}`);

      return null;
    }

    return rows[0];
  }

  /**
   * Inserts a new record and returns the persisted row.
   *
   * @param entity - The entity data to insert.
   * @returns The newly inserted row.
   */
  async function save(entity: K): Promise<K> {
    logger.info(`Saving ${modelName}`);

    const rows = await getDb().insert(table).values(coerceDates(entity) as InsertEntity).returning();

    return rows[0] as K;
  }

  /**
   * Deletes the record matching the given primary key, scoped to the current
   * authorization context, and returns the deleted row.
   *
   * @param id - The primary key of the record to delete.
   * @returns The deleted row.
   */
  async function deleteById(id: number): Promise<K> {
    logger.info(`Deleting ${modelName} by id: ${id}`);

    const rows = await getDb().delete(table).where(
      and(
        eq(table.id, id),
        getAutorizationDatabaseContext(table),
      ),
    ).returning();

    return rows[0] as K;
  }

  /**
   * Returns all records visible to the current authorization context.
   *
   * @returns An array of all matching records.
   */
  async function listAll(): Promise<K[]> {
    logger.info(`Listing all ${modelName}`);

    return await getDb().select().from(table as never).where(
      and(
        getAutorizationDatabaseContext(table),
      ),
    );
  }

  /**
   * Applies a partial update to the record identified by id,
   * scoped to the current authorization context.
   *
   * @param id - The primary key of the record to update.
   * @param entity - Partial fields to apply to the record.
   * @returns The updated row.
   */
  async function update(id: number, entity: Partial<K>): Promise<K> {
    logger.info(`Updating ${modelName} by id: ${id}`);

    const rows = await getDb().update(table).set(coerceDates(entity) as InsertEntity).where(
      and(
        eq(table.id, id),
        getAutorizationDatabaseContext(table),
      ),
    ).returning();

    return (rows as unknown as K[])[0];
  }

  return {
    modelName,
    findById,
    deleteById,
    listAll,
    update,
    save,
  };
}
