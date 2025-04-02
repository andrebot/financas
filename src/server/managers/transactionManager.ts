import ContentManager from './contentManager';
import TransactionRepo from '../resources/repositories/transactionRepo';
import MonthlyBalanceRepo from '../resources/repositories/monthlyBalanceRepo';
import BudgetRepo from '../resources/repositories/budgetRepo';
import GoalRepo from '../resources/repositories/goalRepo';
import { TRANSACTION_TYPES, INVESTMENT_TYPES } from '../types';
import type { ITransaction, IMonthlyBalance, BulkGoalsUpdate } from '../types';
import { calculateLastMonth, parseDate } from '../utils/misc';

export class TransactionManager extends ContentManager<ITransaction> {
  private budgetRepo: typeof BudgetRepo;

  private goalRepo: typeof GoalRepo;

  private monthlyBalanceRepo: typeof MonthlyBalanceRepo;

  /**
   * Fields in Transaction model that trigger recalculation in the system.
   */
  private readonly recalculationFields: Array<keyof ITransaction> = [
    'value', // Impacts balances and budgets
    'category', // Affects budget categorization
    'parentCategory', // Affects budget categorization
    'account', // Impacts account-specific balances
    'date', // Determines monthly balance assignment
    'goalsList', // Affects goal percentages or allocations
    'type', // Determines how the transaction is treated (income, expense, etc.)
  ];

  constructor(
    transactionRepo: typeof TransactionRepo = TransactionRepo,
    budgetRepo: typeof BudgetRepo = BudgetRepo,
    goalRepo: typeof GoalRepo = GoalRepo,
    monthlyBalanceRepo: typeof MonthlyBalanceRepo = MonthlyBalanceRepo,
  ) {
    super(transactionRepo);

    this.budgetRepo = budgetRepo;
    this.goalRepo = goalRepo;
    this.monthlyBalanceRepo = monthlyBalanceRepo;
  }

  /**
   * Gets the last month balance for a transaction. If the last month balance doesn't exist, returns
   * a new monthly balance with the opening balance as the closing balance of the previous month.
   *
   * @param content - The transaction to get the last month balance for.
   * @returns The last month balance.
   */
  private async getLastMonthBalance(content: ITransaction): Promise<IMonthlyBalance> {
    const contentDate = parseDate(content.date);
    const lastMonth = calculateLastMonth(contentDate.getFullYear(), contentDate.getMonth() + 1);
    let lastMonthBalance = await this.monthlyBalanceRepo.findMonthlyBalance(
      content,
      new Date(lastMonth.year, lastMonth.month - 1),
    );

    if (!lastMonthBalance) {
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
   */
  private async addTransactionToMonthlyBalance(content: ITransaction): Promise<void> {
    const contentDate = parseDate(content.date);
    let monthlyBalance = await this.monthlyBalanceRepo.findMonthlyBalance(
      content,
      contentDate,
    );

    if (!monthlyBalance) {
      const lastMonthBalance = await this.getLastMonthBalance(content);

      monthlyBalance = {
        user: content.user,
        account: content.account,
        month: contentDate.getMonth() + 1,
        year: contentDate.getFullYear(),
        openingBalance: lastMonthBalance.closingBalance,
        closingBalance: lastMonthBalance.closingBalance + content.value,
        transactions: [content],
      };

      await this.monthlyBalanceRepo.save(monthlyBalance);
    } else {
      monthlyBalance.transactions.push(content);
      monthlyBalance.closingBalance += content.value;

      await this.monthlyBalanceRepo.update(monthlyBalance.id!, monthlyBalance);
    }
  }

  /**
   * Creates a list of goals to update with the amount to be added to each goal. Then, it updates
   * the goals in bulk.
   *
   * @param transaction - The transaction to update the goals by.
   */
  private async updateGoalsByTransaction(transaction: ITransaction): Promise<void> {
    if (!transaction.goalsList || transaction.goalsList.length === 0) {
      return;
    }

    const goalsToUpdate = transaction.goalsList.map((goal) => {
      const addValue = transaction.value * goal.percentage;

      return {
        goalId: goal.goal.id,
        amount: addValue,
      };
    }) as BulkGoalsUpdate[];

    await this.goalRepo.incrementGoalsInBulk(goalsToUpdate);
  }

  /**
   * Subtracts a transaction from the monthly balance if it exists.
   *
   * @throws {Error} - If the monthly balance for the transaction is not found.
   *
   * @param transaction - The transaction to subtract from the monthly balance.
   */
  private async subtractTransactionFromMonthlyBalance(transaction: ITransaction): Promise<void> {
    const contentDate = parseDate(transaction.date);
    const monthlyBalance = await this.monthlyBalanceRepo.findMonthlyBalance(
      transaction,
      contentDate,
    );

    if (monthlyBalance) {
      monthlyBalance.closingBalance -= transaction.value;
      monthlyBalance.transactions = monthlyBalance.transactions.filter(
        (t) => t.id !== transaction.id,
      );

      await this.monthlyBalanceRepo.update(monthlyBalance.id!, monthlyBalance);
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
  private shouldTriggerRecalculation(payload: Partial<ITransaction>): boolean {
    return Object.keys(payload).some(
      (key) => this.recalculationFields.includes(key as keyof ITransaction),
    );
  }

  /**
   * Deletes a transaction from the monthly balance and updates the goals and budgets.
   *
   * @param transaction - The transaction to delete.
   */
  private async deleteTransactionFromOtherModels(transaction: ITransaction): Promise<void> {
    const invertedTransaction = { ...transaction, value: -transaction.value };

    await this.subtractTransactionFromMonthlyBalance(transaction);
    await this.updateGoalsByTransaction(invertedTransaction);
    await this.budgetRepo.updateBudgetsByNewTransaction(invertedTransaction);
  }

  /**
   * Adds a transaction to the monthly balance and updates the goals and budgets.
   *
   * @param transaction - The transaction to add.
   */
  private async addTransactionToOtherModels(transaction: ITransaction): Promise<void> {
    await this.addTransactionToMonthlyBalance(transaction);
    await this.updateGoalsByTransaction(transaction);
    await this.budgetRepo.updateBudgetsByNewTransaction(transaction);
  }

  /**
   * Creates a new transaction and updates the monthly balance, goals and budgets.
   *
   * @param content - The transaction to create.
   * @returns The created transaction.
   */
  async createContent(content: ITransaction): Promise<ITransaction> {
    const savedTransaction = await super.createContent(content);
    await this.addTransactionToOtherModels(savedTransaction);

    // Create investments here later
    // if (content.type === TRANSACTION_TYPES.INVESTMENT) {
    //   await investmentRepo.updateInvestmentsByTransaction(content);
    // }

    return savedTransaction;
  }

  /**
   * Deletes a transaction and updates the monthly balance, goals and budgets.
   *
   * @param id - The id of the transaction to delete.
   * @param userId - The id of the user deleting the transaction.
   * @param isAdmin - Whether the user deleting the transaction is an admin.
   * @returns The deleted transaction.
   */
  async deleteContent(id: string, userId: string, isAdmin?: boolean): Promise<ITransaction | null> {
    const transaction = await this.repository.findById(id);

    if (!transaction) {
      throw new Error(`Transaction with id ${id} not found. Cannot execute delete action.`);
    }

    await this.deleteTransactionFromOtherModels(transaction);

    return super.deleteContent(id, userId, isAdmin);
  }

  /**
   * Updates a transaction and updates the monthly balance, goals and budgets.
   *
   * @param id - The id of the transaction to update.
   * @param payload - The payload to update the transaction with.
   * @param userId - The id of the user updating the transaction.
   * @param isAdmin - Whether the user updating the transaction is an admin.
   * @returns The updated transaction.
   */
  async updateContent(
    id: string,
    payload: Partial<ITransaction>,
    userId: string,
    isAdmin?: boolean,
  ): Promise<ITransaction | null> {
    const transaction = await this.repository.findById(id);

    if (!transaction) {
      throw new Error(`Transaction with id ${id} not found. Cannot execute update action.`);
    }

    if (this.shouldTriggerRecalculation(payload)) {
      const updatedContent = { ...transaction, ...payload };

      // we remove and add the transaction to other models to ensure consistency
      // and avoid missing updates
      await this.deleteTransactionFromOtherModels(transaction);
      await this.addTransactionToOtherModels(updatedContent);
    }

    return super.updateContent(id, payload, userId, isAdmin);
  }

  /**
   * Gets the transaction types and investment types.
   *
   * @returns The transaction types and investment types.
   */
  getTransactionTypes(): {
    transactionTypes: string[];
    investmentTypes: string[];
    } {
    return {
      transactionTypes: Object.values(TRANSACTION_TYPES),
      investmentTypes: Object.values(INVESTMENT_TYPES),
    };
  }
}

export default new TransactionManager();
