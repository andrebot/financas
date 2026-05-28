import { Pool } from 'pg';

export type EndToEndUser = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const DELETE_USER_EMAIL_REGEX = '.*delete.*@.*';

/**
 * Creates a PostgreSQL connection pool for end-to-end database setup.
 *
 * @returns A PostgreSQL connection pool.
 */
export function createEndToEndPool(): Pool {
  return new Pool({
    connectionString: process.env.DB_URL || 'postgresql://financas:financas@localhost:5432/financas',
  });
}

/**
 * Inserts users required by Playwright tests into the PostgreSQL users table.
 *
 * @param pool - PostgreSQL pool used to execute the inserts.
 * @param users - Users that should be available before the test run starts.
 */
export async function insertEndToEndUsers(
  pool: Pool,
  users: EndToEndUser[],
): Promise<void> {
  await Promise.all(users.map((user) => pool.query(
    `INSERT INTO users (email, "firstName", "lastName", password, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (email) DO NOTHING`,
    [
      user.email,
      user.firstName,
      user.lastName,
      user.password,
      user.createdAt ?? new Date(),
      user.updatedAt ?? null,
    ],
  )));
}

/**
 * Deletes data owned by disposable end-to-end users.
 *
 * @param pool - PostgreSQL pool used to execute cleanup queries.
 */
export async function deleteEndToEndUserData(pool: Pool): Promise<void> {
  await pool.query(
    `DELETE FROM cards
     WHERE "accountId" IN (
       SELECT accounts.id FROM accounts
       INNER JOIN users ON accounts."userId" = users.id
       WHERE users.email ~ $1
     )`,
    [DELETE_USER_EMAIL_REGEX],
  );
  await pool.query(
    `DELETE FROM accounts
     USING users
     WHERE accounts."userId" = users.id AND users.email ~ $1`,
    [DELETE_USER_EMAIL_REGEX],
  );
  await pool.query(
    `DELETE FROM categories
     USING users
     WHERE categories."userId" = users.id AND users.email ~ $1`,
    [DELETE_USER_EMAIL_REGEX],
  );
  await pool.query(
    `DELETE FROM goals
     USING users
     WHERE goals."userId" = users.id AND users.email ~ $1`,
    [DELETE_USER_EMAIL_REGEX],
  );
}

/**
 * Deletes disposable end-to-end users from the PostgreSQL users table.
 *
 * @param pool - PostgreSQL pool used to execute the cleanup query.
 */
export async function deleteEndToEndUsers(pool: Pool): Promise<void> {
  await pool.query('DELETE FROM users WHERE email ~ $1', [DELETE_USER_EMAIL_REGEX]);
}
