import {
  and, eq, gte, inArray, lte, sql,
} from 'drizzle-orm';
import Repository from './repository';
import { budgets, budgetToCategories, budgetUsage } from '../models/budgetModel';
import { createLogger } from '../../utils/logger';
import { getAutorizationDatabaseContext } from '../../utils/authorization';
import { getDb } from '../../utils/transaction';
import type { IBudget, ITransaction } from '../../types';

const logger = createLogger('Repository:Budget');
const budgetRepo = Repository<typeof budgets, IBudget>(budgets, 'Budget', logger);

/**
 * Inserts one budgetUsage row per matching budget for a new transaction.
 * Uses INSERT...SELECT to find all budgets whose category and date range match
 * the transaction, then inserts in a single query.
 *
 * @param transaction - The transaction to record budget usage for.
 */
async function updateBudgetsByNewTransaction(transaction: ITransaction): Promise<void> {
  logger.info(`Updating all budgets affected by new transaction: ${transaction.id}`);

  if (!transaction.categoryId) {
    logger.info(`Transaction: ${transaction.id} has no category, skipping budget update`);
    return;
  }

  const client = getDb();

  await client
    .insert(budgetUsage)
    .select(client
      .select({
        budgetId: budgets.id,
        transactionId: sql<number>`${transaction.id}`.as('transactionId'),
        date: sql<Date>`${transaction.date}`.as('date'),
        valueUsed: sql<string>`${transaction.value}`.as('valueUsed'),
        createdAt: sql<Date>`now()`.as('createdAt'),
        updatedAt: sql<Date>`null`.as('updatedAt'),
      })
      .from(budgets)
      .innerJoin(budgetToCategories, eq(budgetToCategories.budgetId, budgets.id))
      .where(and(
        eq(budgetToCategories.categoryId, transaction.categoryId),
        lte(budgets.startDate, transaction.date),
        gte(budgets.endDate, transaction.date),
        getAutorizationDatabaseContext(budgets),
      )))
    .onConflictDoNothing();
}

/**
 * Removes all budgetUsage rows associated with a transaction being deleted.
 *
 * @param transaction - The transaction whose budget usage rows should be removed.
 */
async function revertBudgetsByTransaction(transaction: ITransaction): Promise<void> {
  logger.info(`Reverting budget usage for transaction: ${transaction.id}`);

  await getDb()
    .delete(budgetUsage)
    .where(eq(budgetUsage.transactionId, transaction.id!));
}

/**
 * Saves the category links for a budget.
 *
 * @param budgetId - The budget receiving category links.
 * @param categoryIds - Category ids linked to the budget.
 */
async function saveBudgetCategories(budgetId: number, categoryIds: number[]): Promise<void> {
  logger.info(`Saving categories for budget: ${budgetId}`);

  if (categoryIds.length === 0) {
    return;
  }

  await getDb()
    .insert(budgetToCategories)
    .values(categoryIds.map((categoryId) => ({ budgetId, categoryId })))
    .onConflictDoNothing();
}

/**
 * Deletes the category links for a budget.
 *
 * @param budgetId - The budget whose category links should be deleted.
 */
async function deleteBudgetCategories(budgetId: number): Promise<void> {
  logger.info(`Deleting categories for budget: ${budgetId}`);

  await getDb()
    .delete(budgetToCategories)
    .where(eq(budgetToCategories.budgetId, budgetId));
}

/**
 * Lists budgets with their linked category rows hydrated.
 *
 * @returns Budgets visible in the authorization context with categories attached.
 */
async function listBudgetsWithCategories(): Promise<IBudget[]> {
  logger.info('Listing budgets with categories');

  const rows = await getDb().query.budgets.findMany({
    with: {
      categories: {
        with: {
          category: true,
        },
      },
    },
    where: getAutorizationDatabaseContext(budgets),
  });

  return rows.map((row) => ({
    ...row,
    categories: row.categories.map((c) => c.category),
  }));
}

/**
 * Lists budgets with their linked categories and the total amount spent against
 * each budget, derived from the budgetUsage table.
 *
 * @returns Budgets with categories and a `spent` field (0 when no usage exists).
 */
async function listBudgetsWithSpent(): Promise<IBudget[]> {
  const budgetsWithCategories = await listBudgetsWithCategories();

  if (budgetsWithCategories.length === 0) {
    return budgetsWithCategories;
  }

  const budgetIds = budgetsWithCategories.map((b) => b.id!);

  const spentRows = await getDb()
    .select({
      budgetId: budgetUsage.budgetId,
      spent: sql<string>`COALESCE(SUM(${budgetUsage.valueUsed}), 0)`,
    })
    .from(budgetUsage)
    .where(inArray(budgetUsage.budgetId, budgetIds))
    .groupBy(budgetUsage.budgetId);

  const spentMap = new Map(spentRows.map((r) => [r.budgetId, Number(r.spent)]));

  return budgetsWithCategories.map((b) => ({
    ...b,
    spent: spentMap.get(b.id!) ?? 0,
  }));
}

export default {
  ...budgetRepo,
  updateBudgetsByNewTransaction,
  revertBudgetsByTransaction,
  saveBudgetCategories,
  deleteBudgetCategories,
  listBudgetsWithCategories,
  listBudgetsWithSpent,
};
