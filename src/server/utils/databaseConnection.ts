import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../resources/models/schema';
import { createLogger } from './logger';
import { DB_URL } from '../config/drizzle';

const logger = createLogger('DatabaseConnection');
export let db: ReturnType<typeof drizzle>;
let pool: Pool;

/**
 * Connects to a PostgreSQL database through Drizzle.
 *
 * @returns A promise that resolves when the connection is successful
 */
function connectToDatabase(): void {
  try {
    logger.info(`Connecting to drizzle: ${DB_URL}`);
    pool = new Pool({ connectionString: DB_URL });
    db = drizzle(pool, { schema, logger: true });

    logger.info('Connected to database');
  } catch (error) {
    logger.error(error);
  }
}

/**
 * Disconnects from the PostgreSQL database.
 *
 * @returns A promise that resolves when the disconnection is successful
 */
async function disconnectFromDatabase(): Promise<void> {
  try {
    await pool.end();

    logger.info('Disconnected from database');
  } catch (error) {
    logger.error(error);
  }
}
export default { connectToDatabase, disconnectFromDatabase };
