import { Logger } from 'winston';
import commonActions from './commonActions';
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
    getContent: async (
      id: number,
    ): Promise<IBudget | null> => getBudgetWithSpent(
      id,
      budgetRepo,
      transactionRepo,
      categoryRepo,
      logger,
    ),
  };
}
