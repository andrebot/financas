import Repository from './repository';
import { eq, and, sql } from 'drizzle-orm';
import { getAutorizationDatabaseContext } from '../../utils/authorization';
import { monthlyBalances } from '../models/monthlyBalanceModel';
import { createLogger } from '../../utils/logger';
import type { IMonthlyBalance, ITransaction } from '../../types';
import { db } from '../../utils/databaseConnection';

const logger = createLogger('Repository:MonthlyBalance');
const monthlyBalanceRepo = Repository<typeof monthlyBalances, IMonthlyBalance>(monthlyBalances, 'MonthlyBalance', logger);

async function findMonthlyBalance(
  transaction: ITransaction,
  date: Date,
): Promise<IMonthlyBalance | null> {
  logger.info(`Finding monthly balance for transaction: ${transaction.id} on date: ${date}`);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const monthlyBalance = await db.select().from(monthlyBalances)
    .where(and(
      eq(monthlyBalances.accountId, transaction.accountId),
      eq(monthlyBalances.year, year),
      eq(monthlyBalances.month, month),
      getAutorizationDatabaseContext(monthlyBalances),
    ));

  return monthlyBalance.length > 0 ? monthlyBalance[0] : null;
}

async function updateMonthlyBalanceWithTransaction(transaction: ITransaction, shouldInvertValue: boolean = false): Promise<void> {
  logger.info(`Updating monthly balance with transaction: ${transaction.id}`);

  const year = transaction.date.getFullYear();
  const month = transaction.date.getMonth() + 1;

  await db.update(monthlyBalances)
    .set({
      closingBalance: sql`closingBalance ${shouldInvertValue ? '-' : '+'} ${transaction.value}`,
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
