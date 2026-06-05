import { Logger } from 'winston';
import commonActions from './commonActions';
import { withTransaction } from '../../utils/transaction';
import type {
  IBudget,
  ITransactionRepo,
  ICategoryRepo,
  ICommonActions,
  IBudgetRepo,
} from '../../types';

/**
 * Calculates the spent value of a budget.
 *
 * @param budget - The budget to calculate the spent value of.
 * @param transactionRepo - The transaction repository to use.
 * @param logger - The logger to use.
 * @returns The spent value of the budget.
 */
export async function calculateBudgetSpent(
  budget: IBudget | null,
  transactionRepo: ITransactionRepo,
  categoryRepo: ICategoryRepo,
  logger: Logger,
): Promise<number> {
  if (!budget) {
    throw new Error('We need a budget to calculate the spent');
  }

  logger.info(`Calculating spent for budget: ${budget.id} from user: ${budget.userId}`);

  const {
    userId,
    startDate,
    endDate,
  } = budget;
  const categoryIds = await categoryRepo.listCategoriesByBudgetId(budget.id);
  const transactions = await transactionRepo.findByCategoryWithDateRange(
    userId,
    categoryIds,
    startDate,
    endDate,
  );

  logger.info(`Found ${transactions.length} transactions for budget: ${budget.id} from user: ${userId}`);
  logger.info(`Calculating spent for budget: ${budget.id} from user: ${userId}`);

  return transactions.reduce((acc, curr) => acc + Number(curr.value), 0);
}

/**
 * Gets a budget with its spent value.
 *
 * @param id - The id of the budget to get.
 * @param budgetRepo - The budget repository to use.
 * @param transactionRepo - The transaction repository to use.
 * @param categoryRepo - The category repository to use.
 * @param logger - The logger to use.
 * @returns The budget with its spent value.
 */
export async function getBudgetWithSpent(
  id: number,
  budgetRepo: IBudgetRepo,
  transactionRepo: ITransactionRepo,
  categoryRepo: ICategoryRepo,
  logger: Logger,
): Promise<IBudget | null> {
  logger.info(`Getting budget with id ${id}`);

  const budget = await budgetRepo.findById(id);

  if (!budget) {
    return null;
  }

  logger.info(`Calculating spent for budget: ${id} from user: ${budget.userId}`);

  const spent = await calculateBudgetSpent(budget, transactionRepo, categoryRepo, logger);

  return { ...budget, spent };
}

/**
 * Requires budget category ids to include at least one selected category.
 *
 * @param categoryIds - Category ids submitted by the client.
 */
function requireBudgetCategoryIds(categoryIds: number[]): void {
  if (categoryIds.length === 0) {
    throw new Error('Budget requires at least one category');
  }
}

/**
 * Removes category-only fields before persisting the budget row.
 *
 * @param payload - Budget update payload submitted by the client.
 * @returns Budget fields that belong to the budgets table.
 */
function toBudgetUpdatePayload(payload: Partial<IBudget>): Partial<IBudget> {
  const budgetPayload = { ...payload };
  delete budgetPayload.categoryIds;
  delete budgetPayload.categories;
  delete budgetPayload.spent;

  return budgetPayload;
}

/**
 * Verifies that every submitted category id belongs to a visible category.
 *
 * @param categoryIds - Category ids submitted by the client.
 * @param categoryRepo - The category repository to validate against.
 */
async function validateBudgetCategoryIds(
  categoryIds: number[],
  categoryRepo: ICategoryRepo,
): Promise<void> {
  const categories = await Promise.all(
    categoryIds.map((categoryId) => categoryRepo.findById(categoryId)),
  );

  if (categories.some((category) => !category)) {
    throw new Error('Budget contains invalid categories');
  }
}

/**
 * Creates a budget and links it to the submitted category ids in one transaction.
 *
 * @param payload - Budget payload submitted by the client.
 * @param budgetRepo - The budget repository to use.
 * @param categoryRepo - The category repository to validate categories with.
 * @param logger - The logger to use.
 * @returns The created budget with its submitted category ids attached.
 */
export async function createBudgetWithCategories(
  payload: IBudget,
  budgetRepo: IBudgetRepo,
  categoryRepo: ICategoryRepo,
  logger: Logger,
): Promise<IBudget> {
  const { categoryIds = [] } = payload;
  const budgetPayload = {
    name: payload.name,
    value: payload.value,
    type: payload.type,
    startDate: payload.startDate,
    endDate: payload.endDate,
    userId: payload.userId,
  };

  logger.info(`Creating budget with ${categoryIds.length} categories`);
  requireBudgetCategoryIds(categoryIds);
  await validateBudgetCategoryIds(categoryIds, categoryRepo);

  return withTransaction(async () => {
    const budget = await budgetRepo.save(budgetPayload);

    await budgetRepo.saveBudgetCategories(budget.id, categoryIds);

    return { ...budget, categoryIds };
  });
}

/**
 * Lists all budgets with their linked categories.
 *
 * @param budgetRepo - The budget repository to use.
 * @param logger - The logger to use.
 * @returns Budgets with hydrated categories.
 */
export async function listBudgetWithCategories(
  budgetRepo: IBudgetRepo,
  logger: Logger,
): Promise<IBudget[]> {
  logger.info('Listing budgets');

  return budgetRepo.listBudgetsWithCategories();
}

/**
 * Updates a budget without allowing updates that would clear all categories.
 *
 * @param id - The id of the budget to update.
 * @param payload - Budget fields submitted by the client.
 * @param budgetRepo - The budget repository to use.
 * @param categoryRepo - The category repository to validate categories with.
 * @param logger - The logger to use.
 * @returns The updated budget, or the unchanged budget when category ids are empty.
 */
export async function updateBudgetWithCategories(
  id: number,
  payload: Partial<IBudget>,
  budgetRepo: IBudgetRepo,
  categoryRepo: ICategoryRepo,
  logger: Logger,
): Promise<IBudget | null> {
  const { categoryIds } = payload;

  if (categoryIds?.length === 0) {
    logger.info(`Skipping budget update for ${id} because categories cannot be empty`);
    return budgetRepo.findById(id);
  }

  if (categoryIds) {
    await validateBudgetCategoryIds(categoryIds, categoryRepo);
  }

  const updatedBudget = await budgetRepo.update(id, toBudgetUpdatePayload(payload));

  if (updatedBudget && categoryIds) {
    await budgetRepo.saveBudgetCategories(id, categoryIds);
    return { ...updatedBudget, categoryIds };
  }

  return updatedBudget;
}

/**
 * Deletes budget category links before deleting the budget row.
 *
 * @param id - The id of the budget to delete.
 * @param budgetRepo - The budget repository to use.
 * @returns The deleted budget, or null when no budget is visible.
 */
export async function deleteBudgetWithCategories(
  id: number,
  budgetRepo: IBudgetRepo,
): Promise<IBudget | null> {
  return withTransaction(async () => {
    await budgetRepo.deleteBudgetCategories(id);
    return budgetRepo.deleteById(id);
  });
}

/**
 * Creates the budget actions. Gets the spent value of a budget is different from the
 * standard get.
 *
 * @param budgetRepo - The budget repository to use.
 * @param transactionRepo - The transaction repository to use.
 * @param logger - The logger to use.
 * @returns The budget actions.
 */
export default function createBudgetActions(
  budgetRepo: IBudgetRepo,
  transactionRepo: ITransactionRepo,
  categoryRepo: ICategoryRepo,
  logger: Logger,
): ICommonActions<IBudget> {
  const commonBudgetActions = commonActions(budgetRepo, 'Budget');

  return {
    ...commonBudgetActions,
    createContent: async (payload: IBudget): Promise<IBudget> => createBudgetWithCategories(
      payload,
      budgetRepo,
      categoryRepo,
      logger,
    ),
    updateContent: async (
      id: number,
      payload: Partial<IBudget>,
    ): Promise<IBudget | null> => updateBudgetWithCategories(
      id,
      payload,
      budgetRepo,
      categoryRepo,
      logger,
    ),
    deleteContent: async (id: number): Promise<IBudget | null> => deleteBudgetWithCategories(
      id,
      budgetRepo,
    ),
    getContent: async (
      id: number,
    ): Promise<IBudget | null> => getBudgetWithSpent(
      id,
      budgetRepo,
      transactionRepo,
      categoryRepo,
      logger,
    ),
    listContent: async (): Promise<IBudget[]> => listBudgetWithCategories(
      budgetRepo,
      logger,
    ),
  };
}
