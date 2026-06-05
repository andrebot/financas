import * as dotenv from 'dotenv';
import {
  createEndToEndPool,
  deleteEndToEndUserData,
  deleteEndToEndUsers,
} from './databaseUtils';

dotenv.config();

/**
 * Cleans PostgreSQL data created by the end-to-end test suite.
 */
export default async function globalTeardown(): Promise<void> {
  const pool = createEndToEndPool();

  try {
    await deleteEndToEndUserData(pool);
    await deleteEndToEndUsers(pool);
    console.log('Users deleted');
  } finally {
    await pool.end();
  }
}
