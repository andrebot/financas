import { createLogger } from '../utils/logger';
import {
  parseDate, calculateLastMonth, checkUserAccess, checkVoidPayload,
} from '../utils/misc';
import {
  ITransaction, IMonthlyBalance, BulkGoalsUpdate, TRANSACTION_TYPES, INVESTMENT_TYPES,
} from '../types';
import MonthlyBalanceRepo from '../resources/repositories/monthlyBalanceRepo';
import GoalRepo from '../resources/repositories/goalRepo';
import BudgetRepo from '../resources/repositories/budgetRepo';
import TransactionRepo from '../resources/repositories/transactionRepo';

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
  'category',
  'parentCategory',
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
  monthlyBalanceRepo = MonthlyBalanceRepo,
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
  monthlyBalanceRepo = MonthlyBalanceRepo,
): Promise<void> {
  const contentDate = parseDate(content.date);

  logger.info(`Getting monthly balance for ${contentDate.getFullYear()}-${contentDate.getMonth() + 1} from user: ${content.user}`);

  let monthlyBalance = await monthlyBalanceRepo.findMonthlyBalance(
    content,
    contentDate,
  );

  if (!monthlyBalance) {
    logger.info('Monthly balance not found, creating new one');

    const lastMonthBalance = await getLastMonthBalance(content);

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
 * Creates a list of goals to update with the amount to be added to each goal. Then, it updates
 * the goals in bulk.
 *
 * @param transaction - The transaction to update the goals by.
 * @param goalRepo - The goal repository to use.
 */
async function updateGoalsByTransaction(
  transaction: ITransaction,
  goalRepo = GoalRepo,
): Promise<void> {
  if (!transaction.goalsList || transaction.goalsList.length === 0) {
    logger.info(`No goals to update for transaction: ${transaction.id}`);

    return;
  }

  logger.info(`Updating ${transaction.goalsList.length} goals for transaction: ${transaction.id}`);

  const goalsToUpdate = transaction.goalsList.map((goal) => {
    const addValue = transaction.value * goal.percentage;

    return {
      goalId: goal.goal.id,
      amount: addValue,
    };
  }) as BulkGoalsUpdate[];

  await goalRepo.incrementGoalsInBulk(goalsToUpdate);
}

/**
 * Subtracts a transaction from the monthly balance if it exists.
 *
 * @throws {Error} - If the monthly balance for the transaction is not found.
 *
 * @param transaction - The transaction to subtract from the monthly balance.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 */
async function subtractTransactionFromMonthlyBalance(
  transaction: ITransaction,
  monthlyBalanceRepo = MonthlyBalanceRepo,
): Promise<void> {
  const contentDate = parseDate(transaction.date);

  logger.info(`Getting monthly balance for ${contentDate.getFullYear()}-${contentDate.getMonth() + 1} from user: ${transaction.user}`);

  const monthlyBalance = await monthlyBalanceRepo.findMonthlyBalance(
    transaction,
    contentDate,
  );

  if (monthlyBalance) {
    logger.info('Monthly balance found, subtracting transaction from it');

    monthlyBalance.closingBalance -= transaction.value;
    monthlyBalance.transactions = monthlyBalance.transactions.filter(
      (t) => t.id !== transaction.id,
    );

    await monthlyBalanceRepo.update(monthlyBalance.id!, monthlyBalance);
  } else {
    throw new Error(`Monthly balance for transaction ${transaction.id} not found. Cannot execute subtract action.`);
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
 * @param goalRepo - The goal repository to use.
 * @param budgetRepo - The budget repository to use.
 */
async function deleteTransactionFromOtherModels(
  transaction: ITransaction,
  monthlyBalanceRepo = MonthlyBalanceRepo,
  goalRepo = GoalRepo,
  budgetRepo = BudgetRepo,
): Promise<void> {
  const invertedTransaction = { ...transaction, value: -transaction.value };

  logger.info(`Deleting transaction: ${transaction.id}`);

  await subtractTransactionFromMonthlyBalance(transaction, monthlyBalanceRepo);
  await updateGoalsByTransaction(invertedTransaction, goalRepo);
  await budgetRepo.updateBudgetsByNewTransaction(invertedTransaction);
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
  monthlyBalanceRepo = MonthlyBalanceRepo,
  goalRepo = GoalRepo,
  budgetRepo = BudgetRepo,
): Promise<void> {
  logger.info(`Adding transaction: ${transaction.id}`);

  await addTransactionToMonthlyBalance(transaction, monthlyBalanceRepo);
  await updateGoalsByTransaction(transaction, goalRepo);
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
  transactionRepo = TransactionRepo,
  monthlyBalanceRepo = MonthlyBalanceRepo,
  goalRepo = GoalRepo,
  budgetRepo = BudgetRepo,
): Promise<ITransaction> {
  logger.info(`Creating new transaction for user: ${content.user}`);

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
  id: string,
  userId: string,
  isAdmin = false,
  transactionRepo = TransactionRepo,
  monthlyBalanceRepo = MonthlyBalanceRepo,
  goalRepo = GoalRepo,
  budgetRepo = BudgetRepo,
): Promise<ITransaction | null> {
  logger.info(`Deleting transaction: ${id}`);

  const transaction = await transactionRepo.findById(id);

  if (!transaction) {
    throw new Error(`Transaction with id ${id} not found. Cannot execute delete action.`);
  }

  checkUserAccess(transaction.user.toString(), userId, isAdmin, 'Transaction', id, 'delete', logger);

  await deleteTransactionFromOtherModels(transaction, monthlyBalanceRepo, goalRepo, budgetRepo);

  logger.info('Removed transaction from other models');

  return transactionRepo.findByIdAndDelete(id);
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
  id: string,
  payload: Partial<ITransaction>,
  userId: string,
  transactionRepo = TransactionRepo,
  monthlyBalanceRepo = MonthlyBalanceRepo,
  goalRepo = GoalRepo,
  budgetRepo = BudgetRepo,
  isAdmin = false,
): Promise<ITransaction | null> {
  logger.info(`Updating transaction: ${id}`);

  checkVoidPayload(payload, 'Transaction', 'update');

  const transaction = await transactionRepo.findById(id);

  if (!transaction) {
    throw new Error(`Transaction with id ${id} not found. Cannot execute update action.`);
  }

  checkUserAccess(transaction.user.toString(), userId, isAdmin, 'Transaction', id, 'update', logger);

  if (shouldTriggerRecalculation(payload)) {
    logger.info('Triggering recalculation');

    const updatedContent = { ...transaction, ...payload };

    // we remove and add the transaction to other models to ensure consistency
    // and avoid missing updates
    await deleteTransactionFromOtherModels(transaction, monthlyBalanceRepo, goalRepo, budgetRepo);
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
  id: string,
  userId: string,
  isAdmin = false,
  transactionRepo = TransactionRepo,
): Promise<ITransaction | null> {
  logger.info(`Getting transaction: ${id}`);

  const transaction = await transactionRepo.findById(id);

  if (!transaction) {
    return null;
  }

  checkUserAccess(transaction.user.toString(), userId, isAdmin, 'Transaction', id, 'get', logger);

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
  userId: string,
  transactionRepo = TransactionRepo,
): Promise<ITransaction[]> {
  logger.info(`Listing transactions for user: ${userId}`);

  return transactionRepo.listAll(userId);
}

export function AccountantManager(
  transactionRepo = TransactionRepo,
  monthlyBalanceRepo = MonthlyBalanceRepo,
  goalRepo = GoalRepo,
  budgetRepo = BudgetRepo,
) {
  return {
    createTransaction: (content: ITransaction) => createTransaction(
      content,
      transactionRepo,
      monthlyBalanceRepo,
      goalRepo,
      budgetRepo,
    ),
    deleteTransaction: (id: string, userId: string, isAdmin = false) => deleteTransaction(
      id,
      userId,
      isAdmin,
      transactionRepo,
      monthlyBalanceRepo,
      goalRepo,
      budgetRepo,
    ),
    updateTransaction: (
      id: string,
      payload: Partial<ITransaction>,
      userId: string,
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
    getTransaction: (id: string, userId: string, isAdmin = false) => getTransaction(
      id,
      userId,
      isAdmin,
      transactionRepo,
    ),
    listTransactions: (userId: string) => listTransactions(userId, transactionRepo),
    getTransactionTypes: () => getTransactionTypes(),
  };
}

export default AccountantManager();
