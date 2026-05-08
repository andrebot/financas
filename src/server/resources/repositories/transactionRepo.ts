import { and, eq, gte, inArray, lte } from 'drizzle-orm';
import { getAutorizationDatabaseContext } from '../../utils/authorization';
import Repository from './repository';
import { goals } from '../models/goalModel';
import { transactions, transactionToGoals } from '../models/transactionModel';
import { db } from '../../utils/databaseConnection';
import { createLogger } from '../../utils/logger';
import type { ITransaction } from '../../types';

const logger = createLogger('Repository:Transaction');
const transactionRepo = Repository<typeof transactions, ITransaction>(transactions, 'Transaction', logger);

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

  return await db.select().from(transactions).where(and(
    eq(transactions.userId, userId),
    inArray(transactions.categoryId, categories),
    gte(transactions.date, startDate),
    lte(transactions.date, endDate),
    getAutorizationDatabaseContext(transactions),
  ));
}

async function removeCategoriesFromTransactions(categoryIds: number[]): Promise<number> {
  logger.info(`Removing categories from transactions: ${categoryIds}`);

  const result = await db.update(transactions).set({ categoryId: null }).where(and(
    inArray(transactions.categoryId, categoryIds),
    getAutorizationDatabaseContext(transactions),
  ));

  return result.rowCount || 0;
}

async function deleteGoalFromTransactions(goalId: number): Promise<number> {
  logger.info(`Deleting goal from transactions: ${goalId}`);

  const result = await db
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

async function findByMonthAndYear(year: number, month: number): Promise<ITransaction[]> {
  logger.info(`Finding transactions by month and year: ${month} ${year}`);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return await db.select().from(transactions).where(and(
    gte(transactions.date, startDate),
    lte(transactions.date, endDate),
  ));
}

async function deleteTransactionFromGoals(transactionId: number): Promise<number> {
  logger.info(`Deleting transaction from goals: ${transactionId}`);

  const result = await db.delete(transactionToGoals).where(eq(transactionToGoals.transactionId, transactionId));

  return result.rowCount || 0;
}

export default {
  ...transactionRepo,
  findByCategoryWithDateRange,
  removeCategoriesFromTransactions,
  deleteGoalFromTransactions,
  findByMonthAndYear,
  deleteTransactionFromGoals,
};
