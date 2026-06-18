import * as dotenv from 'dotenv';
import { loginUser, resetPasswordUser } from './authUtils';
import { bankAccountsUsers } from './bankAccountsPageUtils';
import { categoryUsers } from './categoriesPageUtils';
import { goalsUsers } from './goalsPageUtils';
import { budgetUsers } from './budgetPageUtils';
import { transactionUsers } from './transactionsPageUtils';
import { createEndToEndPool, insertEndToEndUsers } from './databaseUtils';

dotenv.config();

/**
 * Seeds PostgreSQL users required by the end-to-end test suite.
 */
export default async function globalSetup(): Promise<void> {
  const pool = createEndToEndPool();
  const users = [
    loginUser,
    resetPasswordUser,
    ...Object.values(bankAccountsUsers),
    ...Object.values(categoryUsers),
    ...Object.values(goalsUsers),
    ...Object.values(budgetUsers),
    ...Object.values(transactionUsers),
  ];

  try {
    await insertEndToEndUsers(pool, users);
  } finally {
    await pool.end();
  }
}
