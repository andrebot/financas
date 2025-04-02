import { Model } from 'mongoose';
import Repository from './repository';
import TransactionModel, { ITransactionDocument } from '../models/transactionModel';
import { ITransaction } from '../../types';

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
}

export default new TransactionRepo();
