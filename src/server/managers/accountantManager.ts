import { createLogger } from '../utils/logger';
import { withTransaction } from '../utils/transaction';
import {
  calculateLastMonth, checkVoidPayload,
} from '../utils/misc';
import {
  isInflowType,
  isInvestmentType,
  isInvestmentCapitalIn,
  isInvestmentCapitalOut,
} from '../utils/transactionTypeUtils';
import calculateTax from '../engine/taxEngine';
import MonthlyBalanceRepo from '../resources/repositories/monthlyBalanceRepo';
import GoalRepo from '../resources/repositories/goalRepo';
import BudgetRepo from '../resources/repositories/budgetRepo';
import TransactionRepo from '../resources/repositories/transactionRepo';
import InvestmentRepo from '../resources/repositories/investmentRepo';
import {
  ITransaction,
  ITransactionWithRelations,
  IMonthlyBalance,
  TRANSACTION_TYPES,
  INVESTMENT_TYPES,
  ITransactionRepo,
  IMonthlyBalanceRepo,
  IGoalRepo,
  IBudgetRepo,
  IInvestmentRepo,
  IInvestment,
  IInvestmentTransactionEntry,
} from '../types';

const logger = createLogger('AccountantManager');

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
 * @param revert - When true, reverses the transaction's effect on the balance.
 */
async function updateMonthlyBalance(
  content: ITransaction,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  revert = false,
): Promise<void> {
  const { date } = content;

  if (revert) {
    await monthlyBalanceRepo.updateMonthlyBalanceWithTransaction(content, true);
    return;
  }

  const value = Number(content.value);
  const inflow = isInflowType(content.type);
  const closingDelta = inflow ? value : -value;

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
      closingBalance: String(openingBalance + closingDelta),
      totalIn: inflow ? String(value) : '0',
      totalOut: !inflow ? String(value) : '0',
    } as IMonthlyBalance);
  } else {
    logger.info('Monthly balance found, updating it');

    await monthlyBalanceRepo.updateMonthlyBalanceWithTransaction(content, false);
  }
}

/**
 * Applies or reverts the full accounting effects of an investment transaction.
 * Investment transactions affect monthly balance and goals (capital moves only).
 * They never affect budgets.
 *
 * @param transaction - The investment transaction.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @param goalRepo - The goal repository to use.
 * @param revert - When true, reverses all effects.
 */
async function applyInvestmentEffects(
  transaction: ITransaction,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  revert = false,
): Promise<void> {
  await updateMonthlyBalance(transaction, monthlyBalanceRepo, revert);

  if (isInvestmentCapitalIn(transaction.type) || isInvestmentCapitalOut(transaction.type)) {
    await goalRepo.updateGoalFromTransaction(transaction, revert);
  }
}

/**
 * Applies or reverts the full accounting effects of a regular (non-investment) transaction.
 * Regular transactions affect monthly balance and budgets (outflows only, filtered by category).
 * They never affect goals.
 *
 * @param transaction - The regular transaction.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @param budgetRepo - The budget repository to use.
 * @param revert - When true, reverses all effects.
 */
async function applyRegularEffects(
  transaction: ITransaction,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  budgetRepo: IBudgetRepo,
  revert = false,
): Promise<void> {
  await updateMonthlyBalance(transaction, monthlyBalanceRepo, revert);

  if (!isInflowType(transaction.type)) {
    if (revert) {
      await budgetRepo.revertBudgetsByTransaction(transaction);
    } else {
      await budgetRepo.updateBudgetsByNewTransaction(transaction);
    }
  }
}

/**
 * Applies or reverts the accounting effects of a transaction, routing to the
 * correct handler based on whether it is an investment or regular transaction.
 *
 * @param transaction - The transaction to process.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @param goalRepo - The goal repository to use.
 * @param budgetRepo - The budget repository to use.
 * @param revert - When true, reverses all effects.
 */
async function applyTransactionEffects(
  transaction: ITransaction,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
  revert = false,
): Promise<void> {
  if (isInvestmentType(transaction.type)) {
    await applyInvestmentEffects(transaction, monthlyBalanceRepo, goalRepo, revert);
  } else {
    await applyRegularEffects(transaction, monthlyBalanceRepo, budgetRepo, revert);
  }
}

/**
 * Applies an investment transaction entry to the position and goal tables.
 * Creates the investment inline if no id is provided in the entry.
 * Returns a tax transaction payload when the transaction is an investmentDueDate
 * with positive gross income. The caller is responsible for saving that transaction.
 *
 * @param transaction - The saved transaction being applied.
 * @param entry - The investment-specific data carried alongside the transaction.
 * @param investmentRepo - The investment repository to use.
 * @returns A partial tax transaction payload, or null when no tax applies.
 */
async function applyInvestmentTransaction(
  transaction: ITransaction,
  entry: IInvestmentTransactionEntry,
  investmentRepo: IInvestmentRepo,
): Promise<Partial<ITransaction> | null> {
  const entryRef = entry.investment as { id?: number };
  let investmentId: number;

  if (entryRef.id) {
    investmentId = entryRef.id;
  } else {
    logger.info('Creating investment inline from transaction entry');

    const created = await investmentRepo.save({
      ...(entry.investment as Partial<IInvestment>),
      totalInvested: '0',
      archived: false,
    });

    investmentId = created.id!;
  }

  await investmentRepo.saveTransactionLink(
    transaction.id!,
    investmentId,
    entry.quantity,
    entry.unitPrice,
  );

  await investmentRepo.applyTransactionToPosition(
    investmentId,
    transaction,
    entry.quantity,
    entry.unitPrice,
  );

  if (entry.goals && entry.goals.length > 0) {
    await investmentRepo.saveGoalAllocations(investmentId, entry.goals);
  }

  if (transaction.type === 'investmentDueDate') {
    const investment = await investmentRepo.findById(investmentId);

    if (investment) {
      const grossIncome = Number(transaction.value) - Number(investment.totalInvested);
      const holdingMs = transaction.date.getTime() - new Date(investment.createdAt).getTime();
      const holdingDays = Math.floor(holdingMs / (1000 * 60 * 60 * 24));
      const taxAmount = calculateTax(investment.investmentType, grossIncome, holdingDays);

      await investmentRepo.archiveInvestment(investmentId);

      if (taxAmount > 0) {
        return {
          name: `IR - ${investment.name}`,
          type: 'investmentTax' as const,
          value: String(taxAmount),
          accountId: transaction.accountId,
          date: transaction.date,
          userId: transaction.userId,
          investmentType: investment.investmentType,
          parentTransactionId: transaction.id,
        };
      }
    }
  }

  return null;
}

/**
 * Applies the investment-specific side effects of a transaction when an
 * investmentEntry is provided: links/positions the investment and, when a tax
 * transaction results (investmentDueDate), saves it and reflects it in the
 * monthly balance. No-op when no investmentEntry is provided.
 *
 * @param transaction - The saved transaction the entry belongs to.
 * @param investmentEntry - Optional investment-specific data.
 * @param investmentRepo - The investment repository to use.
 * @param transactionRepo - The transaction repository to use.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 */
async function applyInvestmentEntryEffects(
  transaction: ITransaction,
  investmentEntry: IInvestmentTransactionEntry | undefined,
  investmentRepo: IInvestmentRepo,
  transactionRepo: ITransactionRepo,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
): Promise<void> {
  if (!investmentEntry) return;

  const taxPayload = await applyInvestmentTransaction(transaction, investmentEntry, investmentRepo);

  if (taxPayload) {
    const savedTax = await transactionRepo.save(taxPayload as ITransaction);
    await updateMonthlyBalance(savedTax, monthlyBalanceRepo);
  }
}

/**
 * Reverts the investment position impact of a transaction.
 * Pre-deletes the junction row before recalculating so the replay sees the
 * correct remaining state. The cascade delete from deleteById becomes a no-op.
 *
 * @param transaction - The transaction being reverted.
 * @param investmentRepo - The investment repository to use.
 */
async function revertInvestmentTransaction(
  transaction: ITransaction,
  investmentRepo: IInvestmentRepo,
): Promise<void> {
  const link = await investmentRepo.findTransactionLink(transaction.id!);
  if (!link) return;

  await investmentRepo.deleteTransactionLink(transaction.id!);
  await investmentRepo.recalculatePosition(link.investmentId);
}

/**
 * Fully reverts a transaction's accounting and investment effects — the inverse
 * of applying it. Used before recalculation (update) and before deletion.
 *
 * @param transaction - The transaction to revert.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @param goalRepo - The goal repository to use.
 * @param budgetRepo - The budget repository to use.
 * @param investmentRepo - The investment repository to use.
 */
async function revertTransactionEffects(
  transaction: ITransaction,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
  investmentRepo: IInvestmentRepo,
): Promise<void> {
  await applyTransactionEffects(transaction, monthlyBalanceRepo, goalRepo, budgetRepo, true);
  await revertInvestmentTransaction(transaction, investmentRepo);
}

/**
 * Returns true when only the name field is being changed, meaning no financial
 * recalculation is needed.
 *
 * @param payload - The update payload to inspect.
 * @returns True when the payload contains only a name change.
 */
function isNameOnlyChange(payload: Partial<ITransaction>): boolean {
  const keys = Object.keys(payload);
  return keys.length === 1 && keys[0] === 'name';
}

/**
 * Returns true when the payload attempts to change the type of an investment
 * transaction — a disallowed operation (delete and recreate instead).
 *
 * @param transaction - The existing transaction being updated.
 * @param payload - The update payload.
 * @returns True when the payload changes the type of an investment transaction.
 */
function isInvestmentTypeChange(
  transaction: ITransaction,
  payload: Partial<ITransaction>,
): boolean {
  return !!payload.type
    && payload.type !== transaction.type
    && isInvestmentType(transaction.type);
}

/**
 * Creates a new transaction and updates accounting state accordingly.
 * Investment transactions update monthly balance and goals (capital moves).
 * Regular transactions update monthly balance and budgets (outflows only).
 * On investmentDueDate a tax transaction is auto-created with parentTransactionId set.
 *
 * @throws {Error} - If the payload is void.
 *
 * @param content - The transaction to create.
 * @param transactionRepo - The transaction repository to use.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @param goalRepo - The goal repository to use.
 * @param budgetRepo - The budget repository to use.
 * @param investmentRepo - The investment repository to use.
 * @param investmentEntry - Optional investment-specific data.
 * @returns The created transaction.
 */
async function createTransaction(
  content: ITransaction,
  transactionRepo: ITransactionRepo,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
  investmentRepo: IInvestmentRepo,
  investmentEntry?: IInvestmentTransactionEntry,
): Promise<ITransaction> {
  logger.info(`Creating new transaction for user: ${content.userId}`);

  checkVoidPayload(content, 'Transaction', 'create');

  const savedTransaction = await withTransaction(async () => {
    const saved = await transactionRepo.save(content);

    await applyInvestmentEntryEffects(
      saved,
      investmentEntry,
      investmentRepo,
      transactionRepo,
      monthlyBalanceRepo,
    );

    await applyTransactionEffects(saved, monthlyBalanceRepo, goalRepo, budgetRepo);
    return saved;
  });

  logger.info(`Transaction created: ${savedTransaction.id}`);

  return savedTransaction;
}

/**
 * Deletes a transaction and reverses all its accounting effects.
 * Auto-generated children (e.g. investmentTax) are found via parentTransactionId
 * and deleted first. Investment position is recalculated before the cascade delete.
 *
 * @throws {Error} - If the transaction is not found.
 *
 * @param id - The id of the transaction to delete.
 * @param transactionRepo - The transaction repository to use.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @param goalRepo - The goal repository to use.
 * @param budgetRepo - The budget repository to use.
 * @param investmentRepo - The investment repository to use.
 * @returns The deleted transaction.
 */
async function deleteTransaction(
  id: number,
  transactionRepo: ITransactionRepo,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
  investmentRepo: IInvestmentRepo,
): Promise<ITransaction | null> {
  logger.info(`Deleting transaction: ${id}`);

  const transaction = await transactionRepo.findById(id);

  if (!transaction) {
    throw new Error(`Transaction with id ${id} not found. Cannot execute delete action.`);
  }

  return withTransaction(async () => {
    const children = await transactionRepo.findChildTransactions(id);

    await Promise.all(children.map(async (child) => {
      await updateMonthlyBalance(child, monthlyBalanceRepo, true);
      await transactionRepo.deleteById(child.id!);
    }));

    await revertTransactionEffects(
      transaction,
      monthlyBalanceRepo,
      goalRepo,
      budgetRepo,
      investmentRepo,
    );

    logger.info('Removed transaction from other models');

    return transactionRepo.deleteById(id);
  });
}

/**
 * Reverts a transaction's old effects, persists the payload, then reapplies the
 * investment entry and accounting effects for the recalculated transaction.
 * Runs inside its own db transaction so the whole recalculation is atomic.
 *
 * @param id - The id of the transaction to update.
 * @param payload - The payload to update the transaction with.
 * @param transaction - The existing (pre-update) transaction being recalculated.
 * @param transactionRepo - The transaction repository to use.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @param goalRepo - The goal repository to use.
 * @param budgetRepo - The budget repository to use.
 * @param investmentRepo - The investment repository to use.
 * @param investmentEntry - Optional updated investment-specific data.
 * @returns The updated transaction.
 */
async function recalculateTransaction(
  id: number,
  payload: Partial<ITransaction>,
  transaction: ITransaction,
  transactionRepo: ITransactionRepo,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
  investmentRepo: IInvestmentRepo,
  investmentEntry?: IInvestmentTransactionEntry,
): Promise<ITransaction> {
  return withTransaction(async () => {
    await revertTransactionEffects(
      transaction,
      monthlyBalanceRepo,
      goalRepo,
      budgetRepo,
      investmentRepo,
    );

    const updatedTransaction = await transactionRepo.update(id, payload);

    await applyInvestmentEntryEffects(
      updatedTransaction,
      investmentEntry,
      investmentRepo,
      transactionRepo,
      monthlyBalanceRepo,
    );

    await applyTransactionEffects(updatedTransaction, monthlyBalanceRepo, goalRepo, budgetRepo);

    return updatedTransaction;
  });
}

/**
 * Validates a transaction update before any recalculation is attempted.
 * Throws when the payload is void, the transaction doesn't exist, or the
 * update attempts to change the type of an investment transaction.
 *
 * @throws {Error} - If the payload is void.
 * @throws {Error} - If the transaction is not found.
 * @throws {Error} - If an investment transaction's type is changed.
 *
 * @param id - The id of the transaction being updated.
 * @param payload - The payload to update the transaction with.
 * @param transaction - The existing transaction, or null when not found.
 */
function checkTransaction(
  id: number,
  payload: Partial<ITransaction>,
  transaction: ITransaction | null,
): void {
  checkVoidPayload(payload, 'Transaction', 'update');

  if (!transaction) {
    throw new Error(`Transaction with id ${id} not found. Cannot execute update action.`);
  }

  if (isInvestmentTypeChange(transaction, payload)) {
    throw new Error(
      `Cannot change the type of an investment transaction (id: ${id}). Delete and recreate it instead.`,
    );
  }
}

/**
 * Updates a transaction and recalculates all accounting effects when needed.
 * Name-only changes skip recalculation entirely.
 * Investment transactions cannot change type — throw if attempted.
 * All other field changes trigger a full revert of old effects and apply of new effects.
 *
 * @throws {Error} - If the transaction is not found.
 * @throws {Error} - If the payload is void.
 * @throws {Error} - If an investment transaction's type is changed.
 *
 * @param id - The id of the transaction to update.
 * @param payload - The payload to update the transaction with.
 * @param transactionRepo - The transaction repository to use.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @param goalRepo - The goal repository to use.
 * @param budgetRepo - The budget repository to use.
 * @param investmentRepo - The investment repository to use.
 * @param investmentEntry - Optional updated investment-specific data.
 * @returns The updated transaction.
 */
async function updateTransaction(
  id: number,
  payload: Partial<ITransaction>,
  transactionRepo: ITransactionRepo,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
  investmentRepo: IInvestmentRepo,
  investmentEntry?: IInvestmentTransactionEntry,
): Promise<ITransaction | null> {
  logger.info(`Updating transaction: ${id}`);

  const transaction = await transactionRepo.findById(id);

  checkTransaction(id, payload, transaction);

  if (isNameOnlyChange(payload)) {
    return transactionRepo.update(id, payload);
  }

  logger.info('Triggering recalculation');

  return recalculateTransaction(
    id,
    payload,
    transaction!,
    transactionRepo,
    monthlyBalanceRepo,
    goalRepo,
    budgetRepo,
    investmentRepo,
    investmentEntry,
  );
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
 * @param id - The id of the transaction to get.
 * @param transactionRepo - The transaction repository to use.
 * @returns The transaction.
 */
async function getTransaction(
  id: number,
  transactionRepo: ITransactionRepo,
): Promise<ITransaction | null> {
  logger.info(`Getting transaction: ${id}`);

  return transactionRepo.findById(id);
}

/**
 * Lists all transactions for a user.
 *
 * @param transactionRepo - The transaction repository to use.
 * @returns The transactions.
 */
async function listTransactions(
  transactionRepo: ITransactionRepo,
): Promise<ITransactionWithRelations[]> {
  logger.info('Listing transactions');

  return transactionRepo.listAllWithRelations();
}

/**
 * Lists all monthly balance records for a given year and month.
 *
 * @param year - The four-digit year.
 * @param month - The month (1-indexed).
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @returns The monthly balance records for the period.
 */
async function listMonthlyBalances(
  year: number,
  month: number,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
): Promise<IMonthlyBalance[]> {
  logger.info(`Listing monthly balances for ${year}/${month}`);

  return monthlyBalanceRepo.findByYearAndMonth(year, month);
}

/**
 * Creates an accountant manager using the provided repositories.
 * Owns all transaction accounting and investment position management.
 *
 * @param transactionRepo - Repository for transaction persistence.
 * @param monthlyBalanceRepo - Repository for monthly balance updates.
 * @param goalRepo - Repository for goal aggregate updates.
 * @param budgetRepo - Repository for budget usage updates.
 * @param investmentRepo - Repository for investment position management.
 * @returns Transaction and investment orchestration actions with accounting side effects.
 */
export function AccountantManager(
  transactionRepo: ITransactionRepo,
  monthlyBalanceRepo: IMonthlyBalanceRepo,
  goalRepo: IGoalRepo,
  budgetRepo: IBudgetRepo,
  investmentRepo: IInvestmentRepo,
) {
  return {
    createTransaction: (
      content: ITransaction,
      investmentEntry?: IInvestmentTransactionEntry,
    ) => createTransaction(
      content,
      transactionRepo,
      monthlyBalanceRepo,
      goalRepo,
      budgetRepo,
      investmentRepo,
      investmentEntry,
    ),
    deleteTransaction: (id: number) => deleteTransaction(
      id,
      transactionRepo,
      monthlyBalanceRepo,
      goalRepo,
      budgetRepo,
      investmentRepo,
    ),
    updateTransaction: (
      id: number,
      payload: Partial<ITransaction>,
      investmentEntry?: IInvestmentTransactionEntry,
    ) => updateTransaction(
      id,
      payload,
      transactionRepo,
      monthlyBalanceRepo,
      goalRepo,
      budgetRepo,
      investmentRepo,
      investmentEntry,
    ),
    getTransaction: (id: number) => getTransaction(id, transactionRepo),
    listTransactions: () => listTransactions(transactionRepo),
    listMonthlyBalances: (year: number, month: number) => listMonthlyBalances(
      year,
      month,
      monthlyBalanceRepo,
    ),
    getTransactionTypes: () => getTransactionTypes(),
    createInvestment: (investment: Partial<IInvestment>) => investmentRepo.save(investment),
    updateInvestment: (id: number, payload: Partial<IInvestment>) => (
      investmentRepo.update(id, payload)
    ),
    deleteInvestment: (id: number) => investmentRepo.deleteById(id),
    getInvestment: (id: number) => investmentRepo.findById(id),
    listInvestments: () => investmentRepo.listAll(),
  };
}

export default AccountantManager(
  TransactionRepo,
  MonthlyBalanceRepo,
  GoalRepo,
  BudgetRepo,
  InvestmentRepo,
);
