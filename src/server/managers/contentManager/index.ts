import { Logger } from 'winston';
import commonActions from './commonActions';
import BudgetRepo from '../../resources/repositories/budgetRepo';
import CategoryRepo from '../../resources/repositories/categoryRepo';
import GoalRepo from '../../resources/repositories/goalRepo';
import TransactionRepo from '../../resources/repositories/transactionRepo';
import { createLogger } from '../../utils/logger';
import { checkVoidInstance, checkUserAccess } from '../../utils/misc';
import Repository from '../../resources/repositories/repository';
import AccountModel from '../../resources/models/accountModel';
import type {
  IAccount,
  IAccountDocument,
  IAccountRepo,
  ICategoryRepo,
  ICommonActions,
  ContentManagerActions,
  IBudget,
  IBudgetDocument,
  IBudgetRepo,
  ICategory,
  ICategoryDocument,
  IGoal,
  IGoalDocument,
  ITransactionRepo,
} from '../../types';

const AccountRepo = new Repository<IAccountDocument, IAccount>(AccountModel);

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
  goalRepo: Repository<IGoalDocument, IGoal>,
  transactionRepo: ITransactionRepo,
  logger: Logger,
): ICommonActions<IGoal> {
  return {
    ...commonActions<IGoalDocument, IGoal>(goalRepo, 'Goal'),
    deleteContent: async (id: string, userId: string, isAdmin: boolean): Promise<IGoal | null> => {
      if (!id) {
        throw new Error('Goal id is required for deleting action');
      }

      const instance = await goalRepo.findById(id);

      logger.info(`Deleting goal: ${id}`);

      checkVoidInstance(instance, goalRepo.modelName, id);
      checkUserAccess(instance!.user.toString(), userId, isAdmin, goalRepo.modelName, id, 'delete', logger);

      await goalRepo.findByIdAndDelete(id);

      logger.info('Removing goal from transactions');

      await transactionRepo.deleteGoalFromTransactions(id);

      return instance;
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
    ...commonActions<ICategoryDocument, ICategory>(categoryRepo, 'Category'),
    deleteContent: async (
      id: string,
      userId: string,
      isAdmin: boolean,
    ): Promise<ICategory | null> => {
      if (!id) {
        throw new Error('Category id is required for deleting action');
      }

      const instance = await categoryRepo.findById(id);
      const catModelName = categoryRepo.modelName;

      logger.info(`Deleting category and all its subcategories with id: ${id}`);

      checkVoidInstance(instance, catModelName, id);
      checkUserAccess(
        instance!.user.toString(),
        userId,
        isAdmin,
        catModelName,
        id,
        'delete',
        logger,
      );

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

      return categoryRepo.findByIdAndDelete(id);
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
  logger: Logger,
): Promise<number> {
  if (!budget) {
    throw new Error('We need a budget to calculate the spent');
  }

  logger.info(`Calculating spent for budget: ${budget.id} from user: ${budget.user}`);

  const {
    user,
    categories,
    startDate,
    endDate,
  } = budget;
  const transactions = await transactionRepo.findByCategoryWithDateRange(
    user,
    categories,
    startDate,
    endDate,
  );

  logger.info(`Found ${transactions.length} transactions for budget: ${budget.id} from user: ${user}`);
  logger.info(`Calculating spent for budget: ${budget.id} from user: ${user}`);

  return transactions.reduce((acc, curr) => acc + curr.value, 0);
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
  logger: Logger,
): ICommonActions<IBudget> {
  const commonBudgetActions = commonActions<IBudgetDocument, IBudget>(budgetRepo, 'Budget');

  return {
    ...commonBudgetActions,
    getContent: async (
      id: string,
      userId: string,
      isAdmin: boolean,
    ): Promise<IBudget | null> => {
      const budget = await commonBudgetActions.getContent(id, userId, isAdmin);

      if (!budget) {
        return null;
      }

      logger.info(`Calculating spent for budget: ${id} from user: ${budget.user}`);

      const spent = await calculateBudgetSpent(budget, transactionRepo, logger);

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
  goalRepo: Repository<IGoalDocument, IGoal>,
  transactionRepo: ITransactionRepo,
  accountRepo: IAccountRepo,
): ContentManagerActions {
  const logger = createLogger('ContentManager');
  const budgetActions = createBudgetActions(budgetRepo, transactionRepo, logger);
  const categoryActions = createCategoryActions(categoryRepo, transactionRepo, logger);
  const goalActions = createGoalActions(goalRepo, transactionRepo, logger);
  const accountActions = commonActions<IAccountDocument, IAccount>(accountRepo, 'Account');

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
