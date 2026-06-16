import {
  and, eq, gte, inArray, lte,
} from 'drizzle-orm';
import { getAutorizationDatabaseContext } from '../../utils/authorization';
import Repository from './repository';
import { goals } from '../models/goalModel';
import { transactions, transactionToGoals } from '../models/transactionModel';
import { accounts } from '../models/accountModel';
import { categories } from '../models/categoryModel';
import { createLogger } from '../../utils/logger';
import { getDb } from '../../utils/transaction';
import type { ITransaction, ITransactionGoalEntry, ITransactionWithRelations } from '../../types';

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
  categories: number[],
  startDate: Date,
  endDate: Date,
): Promise<ITransaction[]> {
  logger.info(`Finding transactions by category and date range for user: ${userId}`);
  logger.info(`Categories: ${categories}`);
  logger.info(`Start date: ${startDate}`);
  logger.info(`End date: ${endDate}`);

  return getDb()
    .select()
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      inArray(transactions.categoryId, categories),
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
 * Returns the count of transaction-goal junction rows linked to a given goal,
 * scoped to the current authorization context.
 *
 * @remarks
 * Despite the name, this function does not delete rows — it counts existing
 * links and is used upstream to guard goal deletion.
 *
 * @param goalId - The id of the goal to query.
 * @returns The number of transaction entries linked to the goal.
 */
async function deleteGoalFromTransactions(goalId: number): Promise<number> {
  logger.info(`Deleting goal from transactions: ${goalId}`);

  const result = await getDb()
    .select({ goalId: transactionToGoals.goalId })
    .from(transactionToGoals)
    .innerJoin(transactions, eq(transactionToGoals.transactionId, transactions.id))
    .innerJoin(goals, eq(transactionToGoals.goalId, goals.id))
    .where(
      and(
        eq(transactionToGoals.goalId, goalId),
        getAutorizationDatabaseContext(transactions),
        getAutorizationDatabaseContext(goals),
      ),
    );

  return result.length;
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
 * Removes all goal associations for a given transaction from the junction table.
 * Call this before re-saving updated goal links to replace the full set atomically.
 *
 * @param transactionId - The id of the transaction whose goal links should be removed.
 * @returns The number of rows deleted.
 */
async function deleteTransactionFromGoals(transactionId: number): Promise<number> {
  logger.info(`Deleting transaction from goals: ${transactionId}`);

  const result = await getDb()
    .delete(transactionToGoals)
    .where(eq(transactionToGoals.transactionId, transactionId));

  return result.rowCount || 0;
}

/**
 * Inserts junction rows linking a transaction to a list of goals with their percentages.
 * Existing rows for the same transaction are not affected.
 * Call deleteTransactionFromGoals first if replacing the full set.
 *
 * @param transactionId - The id of the transaction to link.
 * @param goals - The list of goal entries with goalId and percentage.
 */
async function saveTransactionGoals(
  transactionId: number,
  goalEntries: ITransactionGoalEntry[],
): Promise<void> {
  if (goalEntries.length === 0) return;

  logger.info(`Saving ${goalEntries.length} goal(s) for transaction: ${transactionId}`);

  await getDb().insert(transactionToGoals).values(
    goalEntries.map((entry) => ({
      transactionId,
      goalId: entry.goalId,
      percentage: String(entry.percentage),
    })),
  );
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
  deleteGoalFromTransactions,
  findByMonthAndYear,
  deleteTransactionFromGoals,
  saveTransactionGoals,
  listAllWithRelations,
};
