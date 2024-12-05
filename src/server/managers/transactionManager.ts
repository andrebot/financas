import ContentManager from './contentManager';
import transactionRepo from '../resources/repositories/transactionRepo';
import monthlyBalanceRepo from '../resources/repositories/monthlyBalanceRepo';
import budgetRepo from '../resources/repositories/budgetRepo';
import goalRepo from '../resources/repositories/goalRepo';
import { TRANSACTION_TYPES, INVESTMENT_TYPES } from '../types';
import type { ITransaction, IMonthlyBalance, BulkGoalsUpdate } from '../types';
import { calculateLastMonth } from '../utils/misc';

class TransactionManager extends ContentManager<ITransaction> {
  /**
   * Fields in Transaction model that trigger recalculation in the system.
   */
  private readonly recalculationFields: Array<keyof ITransaction> = [
    "value", // Impacts balances and budgets
    "category", // Affects budget categorization
    "parentCategory", // Affects budget categorization
    "account", // Impacts account-specific balances
    "date", // Determines monthly balance assignment
    "goalsList", // Affects goal percentages or allocations
    "type" // Determines how the transaction is treated (income, expense, etc.)
  ];

  constructor() {
    super(transactionRepo);
  }

  /**
   * Gets the last month balance for a transaction. If the last month balance doesn't exist, returns
   * a new monthly balance with the opening balance as the closing balance of the previous month.
   *
   * @param content - The transaction to get the last month balance for.
   * @returns The last month balance.
   */
  private async getLastMonthBalance(content: ITransaction): Promise<IMonthlyBalance> {
    const lastMonth = calculateLastMonth(content.date.getFullYear(), content.date.getMonth() + 1);
    let lastMonthBalance = await monthlyBalanceRepo.findOne({
      user: content.user,
      account: content.account,
      month: lastMonth.month,
      year: lastMonth.year,
    });

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
   * Updates the monthly balance for a transaction. If the monthly balance doesn't exist, it creates it.
   *
   * @param content - The transaction to update the monthly balance for.
   */
  private async addTransactionToMonthlyBalance(content: ITransaction): Promise<void> {
    let monthlyBalance = await monthlyBalanceRepo.findOne({
      user: content.user,
      account: content.account,
      month: content.date.getMonth() + 1,
      year: content.date.getFullYear(),
    });

    if (!monthlyBalance) {
      const lastMonthBalance = await this.getLastMonthBalance(content);

      monthlyBalance = {
        user: content.user,
        account: content.account,
        month: content.date.getMonth() + 1,
        year: content.date.getFullYear(),
        openingBalance: lastMonthBalance.closingBalance,
        closingBalance: lastMonthBalance.closingBalance + content.value,
        transactions: [content],
      };
    } else {
      monthlyBalance.transactions.push(content);
      monthlyBalance.closingBalance = monthlyBalance.closingBalance + content.value;
    }

    await monthlyBalanceRepo.save(monthlyBalance);
  }

  /**
   * Creates a list of goals to update with the amount to be added to each goal. Then, it updates
   * the goals in bulk.
   *
   * @param transaction - The transaction to update the goals by.
   */
  private async updateGoalsByTransaction(transaction: ITransaction): Promise<void> {
    const goalsToUpdate = transaction.goalsList.map((goal) => {
      let addValue = transaction.value * goal.percentage;

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
   * @param transaction - The transaction to subtract from the monthly balance.
   */
  private async subtractTransactionFromMonthlyBalance(transaction: ITransaction): Promise<void> {
    const monthlyBalance = await monthlyBalanceRepo.findOne({
      user: transaction.user,
      account: transaction.account,
      month: transaction.date.getMonth() + 1,
      year: transaction.date.getFullYear(),
    });

    if (monthlyBalance) {
      monthlyBalance.closingBalance = monthlyBalance.closingBalance - transaction.value;
      monthlyBalance.transactions = monthlyBalance.transactions.filter((t) => t.id !== transaction.id);
      await monthlyBalanceRepo.save(monthlyBalance);
    }
  }

  /**
   * Checks if the payload contains any of the fields that trigger recalculation.
   *
   * @param payload - The payload to check.
   * @returns True if the payload contains any of the fields that trigger recalculation, false otherwise.
   */
  private shouldTriggerRecalculation(payload: Partial<ITransaction>): boolean {
    return Object.keys(payload).some((key) => this.recalculationFields.includes(key as keyof ITransaction));
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
    await budgetRepo.updateBudgetsByNewTransaction(invertedTransaction);
  }

  /**
   * Adds a transaction to the monthly balance and updates the goals and budgets.
   *
   * @param transaction - The transaction to add.
   */
  private async addTransactionToOtherModels(transaction: ITransaction): Promise<void> {
    await this.addTransactionToMonthlyBalance(transaction);
    await this.updateGoalsByTransaction(transaction);
    await budgetRepo.updateBudgetsByNewTransaction(transaction);
  }

  /**
   * Creates a new transaction and updates the monthly balance, goals and budgets.
   *
   * @param content - The transaction to create.
   * @returns The created transaction.
   */
  async createContent(content: ITransaction): Promise<ITransaction> {
    await this.addTransactionToOtherModels(content);

    // Create investments here later
    // if (content.type === TRANSACTION_TYPES.INVESTMENT) {
    //   await investmentRepo.updateInvestmentsByTransaction(content);
    // }

    return super.createContent(content);
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
    isAdmin?: boolean
  ): Promise<ITransaction | null> {
    const transaction = await this.repository.findById(id);

    if (!transaction) {
      throw new Error(`Transaction with id ${id} not found. Cannot execute update action.`);
    }

    if (this.shouldTriggerRecalculation(payload)) {
      const updatedContent = { ...transaction, ...payload };

      // we remove and add the transaction to other models to ensure consistency and avoid missing updates
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
    }
  }
}

export default new TransactionManager();
