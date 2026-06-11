import { eq, and, sql } from 'drizzle-orm';
import { isInflowType } from '../../utils/transactionTypeUtils';
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
  const inflow = isInflowType(transaction.type);
  const sign = shouldInvertValue ? -1 : 1;
  const value = Number(transaction.value);
  const closingDelta = inflow ? sign * value : -(sign * value);
  const totalInDelta = inflow ? sign * value : 0;
  const totalOutDelta = inflow ? 0 : sign * value;

  await getDb().update(monthlyBalances)
    .set({
      closingBalance: sql`${monthlyBalances.closingBalance} + ${closingDelta}`,
      totalIn: sql`${monthlyBalances.totalIn} + ${totalInDelta}`,
      totalOut: sql`${monthlyBalances.totalOut} + ${totalOutDelta}`,
    })
    .where(and(
      eq(monthlyBalances.accountId, transaction.accountId),
      eq(monthlyBalances.year, year),
      eq(monthlyBalances.month, month),
      getAutorizationDatabaseContext(monthlyBalances),
    ));
}

/**
 * Returns all monthly balance records for a given year and month,
 * scoped to the current authorization context.
 *
 * @param year - The four-digit year.
 * @param month - The month (1-indexed).
 * @returns All matching monthly balance records.
 */
async function findByYearAndMonth(year: number, month: number): Promise<IMonthlyBalance[]> {
  return getDb()
    .select()
    .from(monthlyBalances)
    .where(
      and(
        eq(monthlyBalances.year, year),
        eq(monthlyBalances.month, month),
        getAutorizationDatabaseContext(monthlyBalances),
      ),
    );
}

export default {
  ...monthlyBalanceRepo,
  findMonthlyBalance,
  findByYearAndMonth,
  updateMonthlyBalanceWithTransaction,
};
