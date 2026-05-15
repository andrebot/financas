import { and, eq, InferInsertModel } from 'drizzle-orm';
import { Logger } from 'winston';
import { createLogger } from '../../utils/logger';
import { getAutorizationDatabaseContext } from '../../utils/authorization';
import { getDb } from '../../utils/transaction';
import { IRepository, Table } from '../../types';

export default function Repository<T extends Table, K>(table: T, modelName: string, clogger?: Logger): IRepository<T, K> {
  type InsertEntity = InferInsertModel<typeof table>;

  const logger = clogger || createLogger(`Repository:${modelName}`);

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

  async function save(entity: K): Promise<K> {
    logger.info(`Saving ${modelName}`);

    const rows = await getDb().insert(table).values(entity as InsertEntity).returning();

    return rows[0] as K;
  }

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

  async function listAll(): Promise<K[]> {
    logger.info(`Listing all ${modelName}`);

    return await getDb().select().from(table as never).where(
      and(
        getAutorizationDatabaseContext(table),
      ),
    );
  }

  async function update(id: number, entity: Partial<K>): Promise<K> {
    logger.info(`Updating ${modelName} by id: ${id}`);

    const rows = await getDb().update(table).set(entity as InsertEntity).where(
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
