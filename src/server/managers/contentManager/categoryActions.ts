import { Logger } from 'winston';
import commonActions from './commonActions';
import type {
  ICategoryRepo,
  ITransactionRepo,
  ICategory,
  ICommonActions,
} from '../../types';

/**
 * Deletes a category and all its subcategories.
 *
 * @param id - The id of the category to delete.
 * @param categoryRepo - The category repository to use.
 * @param transactionRepo - The transaction repository to use.
 * @param logger - The logger to use.
 * @returns The deleted category.
 */
export async function deleteCategory(
  id: number,
  categoryRepo: ICategoryRepo,
  transactionRepo: ITransactionRepo,
  logger: Logger,
): Promise<ICategory | null> {
  if (!id) {
    throw new Error('Category id is required for deleting action');
  }

  logger.info(`Deleting category and all its subcategories with id: ${id}`);

  const categoriesDeleted = [id];
  const subcategories = await categoryRepo.findAllSubcategories(id);

  logger.info(`Found ${subcategories.length} subcategories`);

  if (subcategories.length > 0) {
    const deletedCount = await categoryRepo.deleteAllSubcategories(id);
    categoriesDeleted.push(...subcategories.map((s) => s.id!));

    logger.info(`Deleted ${deletedCount} subcategories`);
  }

  const updatedTransactions = await transactionRepo.removeCategoriesFromTransactions(
    categoriesDeleted,
  );

  logger.info(`Removed categories from ${updatedTransactions} transactions`);

  return categoryRepo.deleteById(id);
}

/**
 * Creates the category actions. Deleting a category is different from the
 * standard delete.
 *
 * @param categoryRepo - The category repository to use.
 * @param transactionRepo - The transaction repository to use.
 * @param logger - The logger to use.
 * @returns The category actions.
 */
export default function createCategoryActions(
  categoryRepo: ICategoryRepo,
  transactionRepo: ITransactionRepo,
  logger: Logger,
): ICommonActions<ICategory> {
  return {
    ...commonActions(categoryRepo, 'Category'),
    deleteContent: async (
      id: number,
    ): Promise<ICategory | null> => deleteCategory(id, categoryRepo, transactionRepo, logger),
  };
}
