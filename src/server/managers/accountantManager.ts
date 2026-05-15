import { createLogger } from '../utils/logger';
import { withTransaction } from '../utils/transaction';
import {
  calculateLastMonth, checkVoidPayload,
} from '../utils/misc';
import MonthlyBalanceRepo from '../resources/repositories/monthlyBalanceRepo';
import GoalRepo from '../resources/repositories/goalRepo';
import BudgetRepo from '../resources/repositories/budgetRepo';
import TransactionRepo from '../resources/repositories/transactionRepo';
import {
  ITransaction,
  IMonthlyBalance,
  TRANSACTION_TYPES,
  INVESTMENT_TYPES,
  ITransactionRepo,
  IMonthlyBalanceRepo,
  IGoalRepo,
  IBudgetRepo,
  ITransactionGoalEntry,
} from '../types';

const logger = createLogger('AccountantManager');

/**
 * Fields in Transaction model that trigger recalculation in the system.
 *
 * - value: Impacts balances and budgets
 * - category: Affects budget categorization
 * - parentCategory: Affects budget categorization
 * - account: Impacts account-specific balances
 * - date: Determines monthly balance assignment
 * - goalsList: Affects goal percentages or allocations
 * - type: Determines how the transaction is treated (income, expense, etc.)
 */
const recalculationFields: Array<keyof ITransaction> = [
  'value',
  'categoryId',
  'accountId',
  'date',
  'type',
];

/**
 * Returns the closing balance of the previous month for a given transaction's account.
 * Defaults to 0 if no prior monthly balance exists.
 *
 * @param content - The transaction used to determine account and month.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @returns The closing balance of the previous month as a number.
 */
async function getLastMonthClosingBalance(
  content: ITransaction,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
): Promise<number> {
  const lastMonth = calculateLastMonth(content.date.getFullYear(), content.date.getMonth() + 1);

  logger.info(`Getting last month balance for ${lastMonth.year}-${lastMonth.month}`);

  const lastMonthBalance = await monthlyBalanceRepo.findMonthlyBalance(
    content,
    new Date(lastMonth.year, lastMonth.month - 1),
  );

  return lastMonthBalance ? Number(lastMonthBalance.closingBalance) : 0;
}

/**
 * Updates the monthly balance for a transaction's account and month.
 * Creates the monthly balance if it doesn't exist, using the previous month's
 * closing balance as the opening balance.
 *
 * @param content - The transaction to add to the monthly balance.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 */
async function addTransactionToMonthlyBalance(
  content: ITransaction,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
): Promise<void> {
  const { date } = content;
  const value = Number(content.value);

  logger.info(`Getting monthly balance for ${date.getFullYear()}-${date.getMonth() + 1}`);

  const monthlyBalance = await monthlyBalanceRepo.findMonthlyBalance(content, date);

  if (!monthlyBalance) {
    logger.info('Monthly balance not found, creating new one');

    const openingBalance = await getLastMonthClosingBalance(content, monthlyBalanceRepo);

    await monthlyBalanceRepo.save({
      accountId: content.accountId,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      openingBalance: String(openingBalance),
      closingBalance: String(openingBalance + value),
      totalIn: value > 0 ? String(value) : '0',
      totalOut: value < 0 ? String(Math.abs(value)) : '0',
    } as IMonthlyBalance);
  } else {
    logger.info('Monthly balance found, updating it');

    await monthlyBalanceRepo.updateMonthlyBalanceWithTransaction(content, false);
  }
}

/**
 * Checks if the payload contains any of the fields that trigger recalculation.
 *
 * @param payload - The payload to check.
 * @returns True if the payload contains any of the fields that trigger recalculation,
 * false otherwise.
 */
function shouldTriggerRecalculation(payload: Partial<ITransaction>): boolean {
  return Object.keys(payload).some(
    (key) => recalculationFields.includes(key as keyof ITransaction),
  );
}

/**
 * Reverts a transaction's impact on monthly balance, goal amounts, and budgets.
 * Does NOT delete goal junction rows — callers are responsible for that when needed.
 *
 * @param transaction - The transaction to revert.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @param goalRepo - The goal repository to use.
 * @param budgetRepo - The budget repository to use.
 */
async function deleteTransactionFromOtherModels(
  transaction: ITransaction,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
): Promise<void> {
  logger.info(`Reverting impact of transaction: ${transaction.id}`);

  await monthlyBalanceRepo.updateMonthlyBalanceWithTransaction(transaction, true);
  await goalRepo.updateGoalFromTransaction(transaction, true);
  await budgetRepo.revertBudgetsByTransaction(transaction);
}

/**
 * Adds a transaction to the monthly balance, goals, and budgets.
 * Goal junction rows must already exist before calling this function.
 *
 * @param transaction - The transaction to add.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @param goalRepo - The goal repository to use.
 * @param budgetRepo - The budget repository to use.
 */
async function addTransactionToOtherModels(
  transaction: ITransaction,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
): Promise<void> {
  logger.info(`Adding transaction: ${transaction.id}`);

  await addTransactionToMonthlyBalance(transaction, monthlyBalanceRepo);
  await goalRepo.updateGoalFromTransaction(transaction);
  await budgetRepo.updateBudgetsByNewTransaction(transaction);
}

/**
   * Creates a new transaction and updates the monthly balance, goals and budgets.
   *
   * @throws {Error} - If the payload is void.
   *
   * @param content - The transaction to create.
   * @param goals - The list of goals to associate with the transaction.
   * @param transactionRepo - The transaction repository to use.
   * @param monthlyBalanceRepo - The monthly balance repository to use.
   * @param goalRepo - The goal repository to use.
   * @param budgetRepo - The budget repository to use.
   * @returns The created transaction.
   */
async function createTransaction(
  content: ITransaction,
  goals: ITransactionGoalEntry[] = [],
  transactionRepo: ITransactionRepo,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
): Promise<ITransaction> {
  logger.info(`Creating new transaction for user: ${content.userId}`);

  checkVoidPayload(content, 'Transaction', 'create');

  const savedTransaction = await withTransaction(async () => {
    const saved = await transactionRepo.save(content);
    await transactionRepo.saveTransactionGoals(saved.id!, goals);
    await addTransactionToOtherModels(saved, monthlyBalanceRepo, goalRepo, budgetRepo);
    return saved;
  });

  logger.info(`Transaction created: ${savedTransaction.id}`);

  // Create investments here later
  // if (content.type === TRANSACTION_TYPES.INVESTMENT) {
  //   await investmentRepo.updateInvestmentsByTransaction(content);
  // }

  return savedTransaction;
}

/**
 * Deletes a transaction and updates the monthly balance, goals and budgets.
 * Authorization is enforced at the database level via the request context.
 *
 * @throws {Error} - If the transaction is not found.
 *
 * @param id - The id of the transaction to delete.
 * @param transactionRepo - The transaction repository to use.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @param goalRepo - The goal repository to use.
 * @param budgetRepo - The budget repository to use.
 * @returns The deleted transaction.
 */
async function deleteTransaction(
  id: number,
  transactionRepo: ITransactionRepo,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
): Promise<ITransaction | null> {
  logger.info(`Deleting transaction: ${id}`);

  const transaction = await transactionRepo.findById(id);

  if (!transaction) {
    throw new Error(`Transaction with id ${id} not found. Cannot execute delete action.`);
  }

  return withTransaction(async () => {
    await deleteTransactionFromOtherModels(transaction, monthlyBalanceRepo, goalRepo, budgetRepo);
    await transactionRepo.deleteTransactionFromGoals(id);

    logger.info('Removed transaction from other models');

    return transactionRepo.deleteById(id);
  });
}

/**
 * Updates a transaction and updates the monthly balance, goals and budgets.
 * If goals are provided, the existing goal associations are fully replaced.
 *
 * @throws {Error} - If the transaction is not found.
 * @throws {Error} - If the payload is void.
 *
 * @param id - The id of the transaction to update.
 * @param payload - The payload to update the transaction with.
 * @param goals - Replacement goal associations, or undefined to leave them unchanged.
 * @param transactionRepo - The transaction repository to use.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @param goalRepo - The goal repository to use.
 * @param budgetRepo - The budget repository to use.
 * @returns The updated transaction.
 */
async function updateTransaction(
  id: number,
  payload: Partial<ITransaction>,
  goals: ITransactionGoalEntry[] | undefined,
  transactionRepo: ITransactionRepo,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
): Promise<ITransaction | null> {
  logger.info(`Updating transaction: ${id}`);

  checkVoidPayload(payload, 'Transaction', 'update');

  const transaction = await transactionRepo.findById(id);

  if (!transaction) {
    throw new Error(`Transaction with id ${id} not found. Cannot execute update action.`);
  }

  const updatedContent = { ...transaction, ...payload };

  if (shouldTriggerRecalculation(payload)) {
    logger.info('Triggering recalculation');

    await withTransaction(async () => {
      await deleteTransactionFromOtherModels(transaction, monthlyBalanceRepo, goalRepo, budgetRepo);

      if (goals !== undefined) {
        await transactionRepo.deleteTransactionFromGoals(id);
        await transactionRepo.saveTransactionGoals(id, goals);
      }

      await addTransactionToOtherModels(updatedContent, monthlyBalanceRepo, goalRepo, budgetRepo);
    });
  } else if (goals !== undefined) {
    logger.info('Updating goal associations only');

    await withTransaction(async () => {
      await goalRepo.updateGoalFromTransaction(transaction, true);
      await transactionRepo.deleteTransactionFromGoals(id);
      await transactionRepo.saveTransactionGoals(id, goals);
      await goalRepo.updateGoalFromTransaction(updatedContent);
    });
  }

  return transactionRepo.update(id, payload);
}

/**
 * Gets the transaction types and investment types.
 *
 * @returns The transaction types and investment types.
 */
function getTransactionTypes(): {
  transactionTypes: string[];
  investmentTypes: string[];
  } {
  return {
    transactionTypes: Object.values(TRANSACTION_TYPES),
    investmentTypes: Object.values(INVESTMENT_TYPES),
  };
}

/**
 * Gets a transaction by id.
 *
 * @throws {Error} - If the transaction is not found.
 * @throws {Error} - If the user is not authorized to get the transaction.
 *
 * @param id - The id of the transaction to get.
 * @param transactionRepo - The transaction repository to use.
 * @param userId - The id of the user getting the transaction.
 * @param isAdmin - Whether the user getting the transaction is an admin.
 * @returns The transaction.
 */
async function getTransaction(
  id: number,
  transactionRepo: ITransactionRepo,
): Promise<ITransaction | null> {
  logger.info(`Getting transaction: ${id}`);

  const transaction = await transactionRepo.findById(id);

  return transaction;
}

/**
 * Lists all transactions for a user.
 *
 * @param userId - The id of the user listing the transactions.
 * @param transactionRepo - The transaction repository to use.
 * @returns The transactions.
 */
async function listTransactions(
  transactionRepo: ITransactionRepo,
): Promise<ITransaction[]> {
  logger.info(`Listing transactions`);

  return transactionRepo.listAll();
}

export function AccountantManager(
  transactionRepo: ITransactionRepo,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
) {
  return {
    createTransaction: (content: ITransaction, goals: ITransactionGoalEntry[] = []) => createTransaction(
      content,
      goals,
      transactionRepo,
      monthlyBalanceRepo,
      goalRepo,
      budgetRepo,
    ),
    deleteTransaction: (id: number) => deleteTransaction(
      id,
      transactionRepo,
      monthlyBalanceRepo,
      goalRepo,
      budgetRepo,
    ),
    updateTransaction: (
      id: number,
      payload: Partial<ITransaction>,
      goals: ITransactionGoalEntry[] | undefined,
    ) => updateTransaction(
      id,
      payload,
      goals,
      transactionRepo,
      monthlyBalanceRepo,
      goalRepo,
      budgetRepo,
    ),
    getTransaction: (id: number) => getTransaction(
      id,
      transactionRepo,
    ),
    listTransactions: () => listTransactions(transactionRepo),
    getTransactionTypes: () => getTransactionTypes(),
  };
}

export default AccountantManager(TransactionRepo, MonthlyBalanceRepo, GoalRepo, BudgetRepo);
