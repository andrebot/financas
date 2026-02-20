import { Model } from 'mongoose';
import Repository from './repository';
import TransactionModel from '../models/transactionModel';
import type { ITransaction, ITransactionDocument } from '../../types';

export class TransactionRepo extends Repository<ITransactionDocument, ITransaction> {
  constructor(model: Model<ITransactionDocument> = TransactionModel) {
    super(model);
  }

  /**
   * Finds transactions by category and date range.
   *
   * @param userId - The user id
   * @param categories - The categories to filter by
   * @param startDate - The start date
   * @param endDate - The end date
   * @returns The transactions
   */
  findByCategoryWithDateRange(
    userId: string,
    categories: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<ITransaction[]> {
    this.logger.info(`Finding transactions by category and date range for user: ${userId}`);
    this.logger.info(`Categories: ${categories}`);
    this.logger.info(`Start date: ${startDate}`);
    this.logger.info(`End date: ${endDate}`);

    return this.Model.find({
      user: userId,
      category: { $in: categories },
      date: { $gte: startDate, $lte: endDate },
    });
  }

  /**
   * Removes categories from transactions by a list of category ids.
   *
   * @param categoryIds - The ids of the categories to remove.
   * @returns The number of transactions updated.
   */
  async removeCategoriesFromTransactions(categoryIds: string[]): Promise<number> {
    this.logger.info(`Removing categories from transactions: ${categoryIds}`);

    const result = await this.Model.updateMany(
      { category: { $in: categoryIds } },
      { $unset: { category: 1 } },
    );

    return result.modifiedCount;
  }

  /**
   * Deletes a goal from transactions by a goal id.
   *
   * @param goalId - The id of the goal to delete.
   * @returns The number of transactions updated.
   */
  async deleteGoalFromTransactions(goalId: string): Promise<number> {
    this.logger.info(`Deleting goal from transactions: ${goalId}`);

    const result = await this.Model.updateMany(
      { goalsList: { $elemMatch: { goal: goalId } } },
      { $pull: { goalsList: { goal: goalId } } },
    );

    return result.modifiedCount;
  }
}

export default new TransactionRepo();
