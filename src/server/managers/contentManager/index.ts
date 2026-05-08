import { Logger } from 'winston';
import commonActions from './commonActions';
import BudgetRepo from '../../resources/repositories/budgetRepo';
import CategoryRepo from '../../resources/repositories/categoryRepo';
import GoalRepo from '../../resources/repositories/goalRepo';
import TransactionRepo from '../../resources/repositories/transactionRepo';
import { createLogger } from '../../utils/logger';
import { checkVoidInstance, checkUserAccess } from '../../utils/misc';
import type {
  IAccountRepo,
  ICategoryRepo,
  ICommonActions,
  ContentManagerActions,
  IBudget,
  IBudgetRepo,
  ICategory,
  IGoal,
  IGoalRepo,
  ITransactionRepo,
  IAccount,
} from '../../types';
import Repository from '../../resources/repositories/repository';
import { accounts } from '../../resources/models/accountModel';

const AccountRepo = Repository<typeof accounts, IAccount>(accounts, 'Account');

/**
 * Creates the goal actions. Deleting a goal is different from the
 * standard delete
 *
 * @param goalRepo - The goal repository to use.
 * @param transactionRepo - The transaction repository to use.
 * @param logger - The logger to use.
 * @returns The goal actions.
 */
function createGoalActions(
  goalRepo: IGoalRepo,
  transactionRepo: ITransactionRepo,
  logger: Logger,
): ICommonActions<IGoal> {
  return {
    ...commonActions(goalRepo, 'Goal'),
    deleteContent: async (id: number): Promise<IGoal | null> => {
      if (!id) {
        throw new Error('Goal id is required for deleting action');
      }

      logger.info(`Deleting goal: ${id}`);

      const goal = await goalRepo.deleteById(id);

      checkVoidInstance(goal, goalRepo.modelName, id);

      logger.info('Removing goal from transactions');

      await transactionRepo.deleteGoalFromTransactions(id);

      return goal;
    },
  };
}

/**
 * Creates the category actions. Deleting a category is different from the
 * standard delete
 *
 * @param categoryRepo - The category repository to use.
 * @param transactionRepo - The transaction repository to use.
 * @param logger - The logger to use.
 * @returns The category actions.
 */
function createCategoryActions(
  categoryRepo: ICategoryRepo,
  transactionRepo: ITransactionRepo,
  logger: Logger,
): ICommonActions<ICategory> {
  return {
    ...commonActions(categoryRepo, 'Category'),
    deleteContent: async (
      id: number,
    ): Promise<ICategory | null> => {
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
    },
  };
}

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
 * Creates the budget actions. Gets the spent value of a budget is different from the
 * standard get.
 *
 * @param budgetRepo - The budget repository to use.
 * @param transactionRepo - The transaction repository to use.
 * @param logger - The logger to use.
 * @returns The budget actions.
 */
function createBudgetActions(
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
    ): Promise<IBudget | null> => {
      const budget = await commonBudgetActions.getContent(id);

      if (!budget) {
        return null;
      }

      logger.info(`Calculating spent for budget: ${id} from user: ${budget.userId}`);

      const spent = await calculateBudgetSpent(budget, transactionRepo, categoryRepo, logger);

      return { ...budget, spent };
    },
  };
}

/**
 * Creates the content manager.
 *
 * @param budgetRepo - The budget repository to use.
 * @param categoryRepo - The category repository to use.
 * @param goalRepo - The goal repository to use.
 * @param transactionRepo - The transaction repository to use.
 * @param accountRepo - The account repository to use.
 * @returns The content manager.
 */
export function createContentManager(
  budgetRepo: IBudgetRepo,
  categoryRepo: ICategoryRepo,
  goalRepo: IGoalRepo,
  transactionRepo: ITransactionRepo,
  accountRepo: IAccountRepo,
): ContentManagerActions {
  const logger = createLogger('ContentManager');
  const budgetActions = createBudgetActions(budgetRepo, transactionRepo, categoryRepo, logger);
  const categoryActions = createCategoryActions(categoryRepo, transactionRepo, logger);
  const goalActions = createGoalActions(goalRepo, transactionRepo, logger);
  const accountActions = commonActions(accountRepo, 'Account');

  return {
    budgetActions,
    categoryActions,
    goalActions,
    accountActions,
  };
}

export default createContentManager(
  BudgetRepo,
  CategoryRepo,
  GoalRepo,
  TransactionRepo,
  AccountRepo,
);
