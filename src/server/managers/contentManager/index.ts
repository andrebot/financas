import { Logger } from 'winston';
import commonActions from './commonActions';
import BudgetRepo from '../../resources/repositories/budgetRepo';
import CategoryRepo from '../../resources/repositories/categoryRepo';
import GoalRepo from '../../resources/repositories/goalRepo';
import TransactionRepo from '../../resources/repositories/transactionRepo';
import CardRepo from '../../resources/repositories/cardRepo';
import AccountRepo from '../../resources/repositories/accountRepo';
import { createLogger } from '../../utils/logger';
import { checkVoidInstance } from '../../utils/misc';
import { withTransaction } from '../../utils/transaction';
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
  IAccountPayload,
  ICard,
  ICardBrand,
  ICardClientPayload,
  ICardRepo,
  IAccountWithCards,
} from '../../types';

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
 * Splits the account table fields from the optional full card list submitted by the UI.
 *
 * @param payload - The account payload received by the account actions.
 * @returns Account fields and the submitted card list as separate values.
 */
function splitAccountPayload(payload: IAccountPayload): {
  account: Partial<IAccount>;
  cards: IAccountPayload['cards'];
} {
  const { cards: submittedCards, ...account } = payload;

  return { account, cards: submittedCards };
}

const CARD_BRAND_RULES: Array<{ brand: ICardBrand; pattern: RegExp }> = [
  { brand: 'visa', pattern: /^4/ },
  { brand: 'master', pattern: /^(5[1-5]|2[2-7])/ },
  { brand: 'amex', pattern: /^3[47]/ },
  { brand: 'discover', pattern: /^(6011|65|64[4-9]|622)/ },
  { brand: 'diners', pattern: /^(30[0-5]|36|3[89])/ },
  { brand: 'maestro', pattern: /^(50|5[6-9]|6)/ },
];

/**
 * Detects the client card brand from a persisted card number.
 *
 * @param number - The persisted card number.
 * @returns The card brand expected by the client card flag component.
 */
function detectCardBrand(number: string): ICardBrand {
  const cleanedNumber = number.replace(/\D/g, '');
  const matchingRule = CARD_BRAND_RULES.find((rule) => rule.pattern.test(cleanedNumber));

  return matchingRule?.brand ?? 'unknown';
}

/**
 * Converts a persisted card row to the card payload shape consumed by the client.
 *
 * @param card - The persisted card row.
 * @returns The card payload with UI-derived fields included.
 */
function toClientCardPayload(card: ICard): ICardClientPayload {
  return {
    id: card.id,
    number: card.number,
    expirationDate: card.expirationDate,
    flag: detectCardBrand(card.number),
    last4Digits: card.number.slice(-4),
  };
}

/**
 * Maps one Drizzle-hydrated account to the client card payload shape.
 *
 * @param account - The account loaded with its related cards.
 * @returns The account with client-formatted cards included.
 */
function hydrateAccountCards(account: IAccountWithCards): IAccountPayload {
  return {
    ...account,
    cards: account.cards.map(toClientCardPayload),
  };
}

/**
 * Creates account actions that coordinate account persistence with card list reconciliation.
 *
 * @param accountRepo - The account repository to use.
 * @param cardRepo - The card repository to use.
 * @returns Account actions compatible with the common account controller.
 */
function createAccountActions(
  accountRepo: IAccountRepo,
  cardRepo: ICardRepo,
): ICommonActions<IAccountPayload> {
  const commonAccountActions = commonActions(accountRepo, 'Account');

  return {
    createContent: async (payload: IAccountPayload): Promise<IAccount> => {
      const { account, cards: submittedCards } = splitAccountPayload(payload);

      return withTransaction(async () => {
        const savedAccount = await commonAccountActions.createContent(account as IAccount);

        if (submittedCards !== undefined) {
          await cardRepo.syncAccountCards(savedAccount.id, submittedCards);
        }

        return savedAccount;
      });
    },
    updateContent: async (
      id: number,
      payload: Partial<IAccountPayload>,
    ): Promise<IAccount | null> => {
      const { account, cards: submittedCards } = splitAccountPayload(payload as IAccountPayload);

      return withTransaction(async () => {
        const updatedAccount = await commonAccountActions.updateContent(id, account);

        if (updatedAccount && submittedCards !== undefined) {
          await cardRepo.syncAccountCards(id, submittedCards);
        }

        return updatedAccount;
      });
    },
    deleteContent: commonAccountActions.deleteContent,
    listContent: async (): Promise<IAccountPayload[]> => {
      const accountsList = await accountRepo.listAllWithCards();

      return accountsList.map(hydrateAccountCards);
    },
    getContent: commonAccountActions.getContent,
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
  const budgetActions = createBudgetActions(budgetRepo, transactionRepo, categoryRepo, logger);
  const categoryActions = createCategoryActions(categoryRepo, transactionRepo, logger);
  const goalActions = createGoalActions(goalRepo, transactionRepo, logger);
  const accountActions = createAccountActions(accountRepo, cardRepo);

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
  CardRepo,
);
