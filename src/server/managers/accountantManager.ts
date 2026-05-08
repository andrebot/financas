import { createLogger } from '../utils/logger';
import {
  parseDate, calculateLastMonth, checkUserAccess, checkVoidPayload,
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
  'account',
  'date',
  'goalsList',
  'type',
];

/**
 * Gets the last month balance for a transaction. If the last month balance doesn't exist, returns
 * a new monthly balance with the opening balance as the closing balance of the previous month.
 *
 * @param content - The transaction to get the last month balance for.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @returns The last month balance.
 */
async function getLastMonthBalance(
  content: ITransaction,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
): Promise<IMonthlyBalance> {
  const contentDate = parseDate(content.date);
  const lastMonth = calculateLastMonth(contentDate.getFullYear(), contentDate.getMonth() + 1);

  logger.info(`Getting last month balance for ${lastMonth.year}-${lastMonth.month} from user: ${content.user}`);

  let lastMonthBalance = await monthlyBalanceRepo.findMonthlyBalance(
    content,
    new Date(lastMonth.year, lastMonth.month - 1),
  );

  if (!lastMonthBalance) {
    logger.info('Last month balance not found, creating new one');

    lastMonthBalance = {
      user: content.user,
      account: content.account,
      month: lastMonth.month,
      year: lastMonth.year,
      openingBalance: 0,
      closingBalance: 0,
      transactions: [],
    };
  }

  return lastMonthBalance;
}

/**
 * Updates the monthly balance for a transaction. If the monthly balance doesn't exist,
 * it creates it.
 *
 * @param content - The transaction to update the monthly balance for.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 */
async function addTransactionToMonthlyBalance(
  content: ITransaction,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
): Promise<void> {
  const contentDate = parseDate(content.date);

  logger.info(`Getting monthly balance for ${contentDate.getFullYear()}-${contentDate.getMonth() + 1} from user: ${content.user}`);

  let monthlyBalance = await monthlyBalanceRepo.findMonthlyBalance(
    content,
    contentDate,
  );

  if (!monthlyBalance) {
    logger.info('Monthly balance not found, creating new one');

    const lastMonthBalance = await getLastMonthBalance(content, monthlyBalanceRepo);

    monthlyBalance = {
      user: content.user,
      account: content.account,
      month: contentDate.getMonth() + 1,
      year: contentDate.getFullYear(),
      openingBalance: lastMonthBalance.closingBalance,
      closingBalance: lastMonthBalance.closingBalance + content.value,
      transactions: [content],
    };

    await monthlyBalanceRepo.save(monthlyBalance);
  } else {
    logger.info('Monthly balance found, adding transaction to it');

    monthlyBalance.transactions.push(content);
    monthlyBalance.closingBalance += content.value;

    await monthlyBalanceRepo.update(monthlyBalance.id!, monthlyBalance);
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
 * Deletes a transaction from the monthly balance and updates the goals and budgets.
 *
 * @param transaction - The transaction to delete.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @param transactionRepo - The transaction repository to use.
 * @param budgetRepo - The budget repository to use.
 */
async function deleteTransactionFromOtherModels(
  transaction: ITransaction,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  transactionRepo: ITransactionRepo,
  goalRepo: IGoalRepo,
): Promise<void> {
  logger.info(`Deleting transaction: ${transaction.id}`);

  await monthlyBalanceRepo.updateMonthlyBalanceWithTransaction(transaction, true);
  await goalRepo.updateGoalFromTransaction(transaction, true);
  await transactionRepo.deleteTransactionFromGoals(transaction.id);
}

/**
 * Adds a transaction to the monthly balance and updates the goals and budgets.
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
  await budgetRepo.updateBudgetsByNewTransaction(transaction);
}

/**
   * Creates a new transaction and updates the monthly balance, goals and budgets.
   *
   * @throws {Error} - If the payload is void.
   *
   * @param content - The transaction to create.
   * @param transactionRepo - The transaction repository to use.
   * @param monthlyBalanceRepo - The monthly balance repository to use.
   * @param goalRepo - The goal repository to use.
   * @param budgetRepo - The budget repository to use.
   * @returns The created transaction.
   */
async function createTransaction(
  content: ITransaction,
  transactionRepo: ITransactionRepo,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
): Promise<ITransaction> {
  logger.info(`Creating new transaction for user: ${content.userId}`);

  checkVoidPayload(content, 'Transaction', 'create');

  const savedTransaction = await transactionRepo.save(content);
  await addTransactionToOtherModels(savedTransaction, monthlyBalanceRepo, goalRepo, budgetRepo);

  logger.info(`Transaction created: ${savedTransaction.id}`);

  // Create investments here later
  // if (content.type === TRANSACTION_TYPES.INVESTMENT) {
  //   await investmentRepo.updateInvestmentsByTransaction(content);
  // }

  return savedTransaction;
}

/**
 * Deletes a transaction and updates the monthly balance, goals and budgets.
 *
 * @throws {Error} - If the transaction is not found.
 * @throws {Error} - If the user is not authorized to delete the transaction.
 *
 * @param id - The id of the transaction to delete.
 * @param userId - The id of the user deleting the transaction.
 * @param isAdmin - Whether the user deleting the transaction is an admin.
 * @param transactionRepo - The transaction repository to use.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @param goalRepo - The goal repository to use.
 * @param budgetRepo - The budget repository to use.
 * @returns The deleted transaction.
 */
async function deleteTransaction(
  id: number,
  userId: number,
  transactionRepo: ITransactionRepo,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
  isAdmin: boolean,
): Promise<ITransaction | null> {
  logger.info(`Deleting transaction: ${id}`);

  const transaction = await transactionRepo.findById(id);

  if (!transaction) {
    throw new Error(`Transaction with id ${id} not found. Cannot execute delete action.`);
  }

  checkUserAccess(transaction.userId, userId, isAdmin, 'Transaction', id, 'delete', logger);

  await deleteTransactionFromOtherModels(transaction, monthlyBalanceRepo, transactionRepo, budgetRepo);

  logger.info('Removed transaction from other models');

  return transactionRepo.deleteById(id);
}

/**
 * Updates a transaction and updates the monthly balance, goals and budgets.
 *
 * @throws {Error} - If the transaction is not found.
 * @throws {Error} - If the payload is void.
 * @throws {Error} - If the user is not authorized to update the transaction.
 *
 * @param id - The id of the transaction to update.
 * @param payload - The payload to update the transaction with.
 * @param userId - The id of the user updating the transaction.
 * @param isAdmin - Whether the user updating the transaction is an admin.
 * @param transactionRepo - The transaction repository to use.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @param goalRepo - The goal repository to use.
 * @param budgetRepo - The budget repository to use.
 * @returns The updated transaction.
 */
async function updateTransaction(
  id: number,
  payload: Partial<ITransaction>,
  userId: number,
  transactionRepo: ITransactionRepo,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
  isAdmin: boolean,
): Promise<ITransaction | null> {
  logger.info(`Updating transaction: ${id}`);

  checkVoidPayload(payload, 'Transaction', 'update');

  const transaction = await transactionRepo.findById(id);

  if (!transaction) {
    throw new Error(`Transaction with id ${id} not found. Cannot execute update action.`);
  }

  checkUserAccess(transaction.userId, userId, isAdmin, 'Transaction', id, 'update', logger);

  if (shouldTriggerRecalculation(payload)) {
    logger.info('Triggering recalculation');

    const updatedContent = { ...transaction, ...payload };

    // we remove and add the transaction to other models to ensure consistency
    // and avoid missing updates
    await deleteTransactionFromOtherModels(transaction, monthlyBalanceRepo, transactionRepo, budgetRepo);
    await addTransactionToOtherModels(updatedContent, monthlyBalanceRepo, goalRepo, budgetRepo);
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
  userId: number,
  transactionRepo: ITransactionRepo,
  isAdmin: boolean,
): Promise<ITransaction | null> {
  logger.info(`Getting transaction: ${id}`);

  const transaction = await transactionRepo.findById(id);

  if (!transaction) {
    return null;
  }

  checkUserAccess(transaction.userId, userId, isAdmin, 'Transaction', id, 'get', logger);

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
  userId: number,
  transactionRepo: ITransactionRepo,
): Promise<ITransaction[]> {
  logger.info(`Listing transactions for user: ${userId}`);

  return transactionRepo.listAll(userId);
}

export function AccountantManager(
  transactionRepo: ITransactionRepo,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
) {
  return {
    createTransaction: (content: ITransaction) => createTransaction(
      content,
      transactionRepo,
      monthlyBalanceRepo,
      goalRepo,
      budgetRepo,
    ),
    deleteTransaction: (id: number, userId: number, isAdmin = false) => deleteTransaction(
      id,
      userId,
      transactionRepo,
      monthlyBalanceRepo,
      goalRepo,
      budgetRepo,
      isAdmin,
    ),
    updateTransaction: (
      id: number,
      payload: Partial<ITransaction>,
      userId: number,
      isAdmin = false,
    ) => updateTransaction(
      id,
      payload,
      userId,
      transactionRepo,
      monthlyBalanceRepo,
      goalRepo,
      budgetRepo,
      isAdmin,
    ),
    getTransaction: (id: number, userId: number, isAdmin = false) => getTransaction(
      id,
      userId,
      transactionRepo,
      isAdmin,
    ),
    listTransactions: (userId: number) => listTransactions(userId, transactionRepo),
    getTransactionTypes: () => getTransactionTypes(),
  };
}

export default AccountantManager(TransactionRepo, MonthlyBalanceRepo, GoalRepo, BudgetRepo);
