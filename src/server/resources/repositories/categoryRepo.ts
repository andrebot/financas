import { and, eq } from 'drizzle-orm';
import { getDb } from '../../utils/transaction';
import Repository from './repository';
import { categories } from '../models/categoryModel';
import { createLogger } from '../../utils/logger';
import { getAutorizationDatabaseContext } from '../../utils/authorization';
import { budgetToCategories, budgets } from '../models/budgetModel';
import type { ICategory } from '../../types';

const logger = createLogger('Repository:Category');
const categoryRepo = Repository<typeof categories, ICategory>(categories, 'Category', logger);

/**
 * Finds all subcategories of a parent category.
 *
 * @param parentCategoryId - The id of the parent category.
 * @returns The subcategories.
 */
async function findAllSubcategories(parentCategoryId: number): Promise<ICategory[]> {
  logger.info(`Finding all subcategories of parent category: ${parentCategoryId}`);

  return getDb().select().from(categories).where(
    and(
      eq(categories.parentCategoryId, parentCategoryId),
      getAutorizationDatabaseContext(categories),
    ),
  );
}

/**
 * Deletes all subcategories of a parent category.
 *
 * @param parentCategoryId - The id of the parent category.
 * @returns The number of deleted subcategories.
 */
async function deleteAllSubcategories(parentCategoryId: number): Promise<number | null> {
  logger.info(`Deleting all subcategories of parent category: ${parentCategoryId}`);

  const deletedCount = await getDb().delete(categories).where(
    and(
      eq(categories.parentCategoryId, parentCategoryId),
      getAutorizationDatabaseContext(categories),
    ),
  );

  return deletedCount.rowCount;
}

async function listCategoriesByBudgetId(budgetId: number): Promise<number[]> {
  logger.info(`Finding categories by budget id: ${budgetId}`);

  const rows = await getDb()
    .select({ categoryId: budgetToCategories.categoryId })
    .from(budgetToCategories)
    .innerJoin(budgets, eq(budgetToCategories.budgetId, budgets.id))
    .innerJoin(categories, eq(budgetToCategories.categoryId, categories.id))
    .where(
      and(
        eq(budgetToCategories.budgetId, budgetId),
        getAutorizationDatabaseContext(budgets),
        getAutorizationDatabaseContext(categories),
      ),
    );

  return rows.map((row) => row.categoryId);
}

export default {
  ...categoryRepo,
  findAllSubcategories,
  deleteAllSubcategories,
  listCategoriesByBudgetId,
};
