import BudgetRepo from '../../resources/repositories/budgetRepo';
import CategoryRepo from '../../resources/repositories/categoryRepo';
import GoalRepo from '../../resources/repositories/goalRepo';
import TransactionRepo from '../../resources/repositories/transactionRepo';
import CardRepo from '../../resources/repositories/cardRepo';
import AccountRepo from '../../resources/repositories/accountRepo';
import { createLogger } from '../../utils/logger';
import accountActions from './accountActions';
import goalActions from './goalActions';
import budgetActions from './budgetActions';
import categoryActions from './categoryActions';
import type {
  IAccountRepo,
  ICategoryRepo,
  ContentManagerActions,
  IBudgetRepo,
  IGoalRepo,
  ITransactionRepo,
  ICardRepo,
} from '../../types';

/**
 * Creates the content manager.
 *
 * @param budgetRepo - The budget repository to use.
 * @param categoryRepo - The category repository to use.
 * @param goalRepo - The goal repository to use.
 * @param transactionRepo - The transaction repository to use.
 * @param accountRepo - The account repository to use.
 * @param cardRepo - The card repository to use.
 * @returns The content manager.
 */
export function createContentManager(
  budgetRepo: IBudgetRepo,
  categoryRepo: ICategoryRepo,
  goalRepo: IGoalRepo,
  transactionRepo: ITransactionRepo,
  accountRepo: IAccountRepo,
  cardRepo: ICardRepo,
): ContentManagerActions {
  const logger = createLogger('ContentManager');

  return {
    budgetActions: budgetActions(budgetRepo, transactionRepo, categoryRepo, logger),
    categoryActions: categoryActions(categoryRepo, transactionRepo, logger),
    goalActions: goalActions(goalRepo, transactionRepo, logger),
    accountActions: accountActions(accountRepo, cardRepo, logger),
  };
}

export default createContentManager(
  BudgetRepo,
  CategoryRepo,
  GoalRepo,
  TransactionRepo,
  AccountRepo,
  CardRepo,
);
