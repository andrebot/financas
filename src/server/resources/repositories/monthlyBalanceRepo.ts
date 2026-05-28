import { eq, and, sql } from 'drizzle-orm';
import Repository from './repository';
import { getAutorizationDatabaseContext } from '../../utils/authorization';
import { monthlyBalances } from '../models/monthlyBalanceModel';
import { createLogger } from '../../utils/logger';
import type { IMonthlyBalance, ITransaction } from '../../types';
import { getDb } from '../../utils/transaction';

const logger = createLogger('Repository:MonthlyBalance');
const monthlyBalanceRepo = Repository<typeof monthlyBalances, IMonthlyBalance>(monthlyBalances, 'MonthlyBalance', logger);

/**
 * Finds the monthly balance for a transaction's account on a given month.
 *
 * @param transaction - The transaction used to match accountId.
 * @param date - The date whose year and month are used to look up the balance.
 * @returns The monthly balance, or null if none exists for that account and month.
 */
async function findMonthlyBalance(
  transaction: ITransaction,
  date: Date,
): Promise<IMonthlyBalance | null> {
  logger.info(`Finding monthly balance for transaction: ${transaction.id} on date: ${date}`);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const monthlyBalance = await getDb().select().from(monthlyBalances)
    .where(and(
      eq(monthlyBalances.accountId, transaction.accountId),
      eq(monthlyBalances.year, year),
      eq(monthlyBalances.month, month),
      getAutorizationDatabaseContext(monthlyBalances),
    ));

  return monthlyBalance.length > 0 ? monthlyBalance[0] : null;
}

/**
 * Updates the monthly balance closing balance, totalIn, and totalOut for a transaction.
 * When shouldInvertValue is true, the transaction's impact is reversed (used on delete/revert).
 *
 * @param transaction - The transaction to apply or revert.
 * @param shouldInvertValue - Whether to subtract instead of add the transaction value.
 */
async function updateMonthlyBalanceWithTransaction(
  transaction: ITransaction,
  shouldInvertValue: boolean = false,
): Promise<void> {
  logger.info(`Updating monthly balance with transaction: ${transaction.id}`);

  const year = transaction.date.getFullYear();
  const month = transaction.date.getMonth() + 1;
  const op = shouldInvertValue ? '-' : '+';

  await getDb().update(monthlyBalances)
    .set({
      closingBalance: sql`${monthlyBalances.closingBalance} ${sql.raw(op)} ${transaction.value}`,
      totalIn: sql`${monthlyBalances.totalIn} ${sql.raw(op)}
        CASE WHEN ${transaction.value}::numeric > 0 THEN ${transaction.value}::numeric ELSE 0 END`,
      totalOut: sql`${monthlyBalances.totalOut} ${sql.raw(op)}
        CASE WHEN ${transaction.value}::numeric < 0
        THEN ABS(${transaction.value}::numeric) ELSE 0 END`,
    })
    .where(and(
      eq(monthlyBalances.accountId, transaction.accountId),
      eq(monthlyBalances.year, year),
      eq(monthlyBalances.month, month),
      getAutorizationDatabaseContext(monthlyBalances),
    ));
}

export default {
  ...monthlyBalanceRepo,
  findMonthlyBalance,
  updateMonthlyBalanceWithTransaction,
};
