import {
  and, eq, gte, inArray, lte,
} from 'drizzle-orm';
import { getAutorizationDatabaseContext } from '../../utils/authorization';
import Repository from './repository';
import { transactions } from '../models/transactionModel';
import { accounts } from '../models/accountModel';
import { categories } from '../models/categoryModel';
import { createLogger } from '../../utils/logger';
import { getDb } from '../../utils/transaction';
import type { ITransaction, ITransactionWithRelations } from '../../types';

const logger = createLogger('Repository:Transaction');
const transactionRepo = Repository<typeof transactions, ITransaction>(transactions, 'Transaction', logger);

/**
 * Finds all transactions for a user that belong to given categories within a date range.
 *
 * @param userId - The id of the user whose transactions to query.
 * @param categories - The list of category ids to filter by.
 * @param startDate - The start of the date range (inclusive).
 * @param endDate - The end of the date range (inclusive).
 * @returns The matching transactions.
 */
async function findByCategoryWithDateRange(
  userId: number,
  categoriesIds: number[],
  startDate: Date,
  endDate: Date,
): Promise<ITransaction[]> {
  logger.info(`Finding transactions by category and date range for user: ${userId}`);
  logger.info(`Categories: ${categoriesIds}`);
  logger.info(`Start date: ${startDate}`);
  logger.info(`End date: ${endDate}`);

  return getDb()
    .select()
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      inArray(transactions.categoryId, categoriesIds),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate),
      getAutorizationDatabaseContext(transactions),
    ));
}

/**
 * Removes category associations from all transactions that belong to the given categories.
 * Used when categories are deleted to avoid orphaned references.
 *
 * @param categoryIds - The ids of the categories to disassociate.
 * @returns The number of transactions updated.
 */
async function removeCategoriesFromTransactions(categoryIds: number[]): Promise<number> {
  logger.info(`Removing categories from transactions: ${categoryIds}`);

  const result = await getDb().update(transactions).set({ categoryId: null }).where(and(
    inArray(transactions.categoryId, categoryIds),
    getAutorizationDatabaseContext(transactions),
  ));

  return result.rowCount || 0;
}

/**
 * Finds all transactions for a given year and month without authorization filtering.
 *
 * @remarks
 * Intended for internal system operations such as monthly balance recalculations
 * where user-level scoping is not required.
 *
 * @param year - The full four-digit year to query.
 * @param month - The month to query (1-indexed).
 * @returns All transactions in that month.
 */
async function findByMonthAndYear(year: number, month: number): Promise<ITransaction[]> {
  logger.info(`Finding transactions by month and year: ${month} ${year}`);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return getDb().select().from(transactions).where(and(
    gte(transactions.date, startDate),
    lte(transactions.date, endDate),
  ));
}

/**
 * Lists all transactions for the current authorization context, joined with
 * their related account name and category name.
 *
 * @returns Transactions enriched with `accountName` and `categoryName`.
 */
async function listAllWithRelations(): Promise<ITransactionWithRelations[]> {
  return getDb()
    .select({
      id: transactions.id,
      name: transactions.name,
      categoryId: transactions.categoryId,
      accountId: transactions.accountId,
      cardId: transactions.cardId,
      type: transactions.type,
      date: transactions.date,
      value: transactions.value,
      investmentType: transactions.investmentType,
      userId: transactions.userId,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
      accountName: accounts.name,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(getAutorizationDatabaseContext(transactions)) as Promise<ITransactionWithRelations[]>;
}

export default {
  ...transactionRepo,
  findByCategoryWithDateRange,
  removeCategoriesFromTransactions,
  findByMonthAndYear,
  listAllWithRelations,
};
