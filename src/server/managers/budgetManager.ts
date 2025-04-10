import ContentManager from './contentManager';
import BudgetRepo from '../resources/repositories/budgetRepo';
import TransactionRepo from '../resources/repositories/transactionRepo';
import type { IBudget } from '../types';

export class BudgetManager extends ContentManager<IBudget> {
  private transactionRepo: typeof TransactionRepo;

  constructor(budgetRepo: typeof BudgetRepo = BudgetRepo) {
    super(budgetRepo, 'BudgetManager');

    this.transactionRepo = TransactionRepo;
  }

  /**
   * Calculate the spent value of the budget by
   * querying the transactions related to the budget
   * by category and date
   *
   * @throws {Error} If the budget is not provided
   *
   * @param budget - The budget to calculate the spent value of
   * @returns {Promise<number>} The spent value
   */
  async calculateSpent(budget: IBudget): Promise<number> {
    if (!budget) {
      throw new Error('We need a budget to calculate the spent');
    }

    const {
      user, categories, startDate, endDate,
    } = budget;

    const transactions = await this.transactionRepo.findByCategoryWithDateRange(
      user,
      categories,
      startDate,
      endDate,
    );

    this.logger.info(`Calculating spent for budget: ${budget.id} from user: ${user}`);

    return transactions.reduce((acc, curr) => acc + curr.value, 0);
  }

  /**
   * Get a budget with the spent value
   *
   * @param budgetId - The id of the budget to get
   * @returns {Promise<IBudget>} The budget with the spent value
   */
  async getContent(id: string): Promise<IBudget> {
    const budget = await this.repository.findById(id);

    if (!budget) {
      return {} as IBudget;
    }

    this.logger.info(`Calculating spent for budget: ${id} from user: ${budget.user}`);

    const budgetWithSpent = await this.calculateSpent(budget);

    return { ...budget, spent: budgetWithSpent };
  }
}

export default new BudgetManager();
