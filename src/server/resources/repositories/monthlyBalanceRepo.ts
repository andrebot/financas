import { Model } from 'mongoose';
import MonthlyBalanceModel, { IMonthlyBalanceDocument } from '../models/monthlyBalanceModel';
import Repository from './repository';
import { IMonthlyBalance } from '../../types';

class MonthlyBalanceRepo extends Repository<IMonthlyBalanceDocument, IMonthlyBalance> {
  constructor(model: Model<IMonthlyBalanceDocument> = MonthlyBalanceModel) {
    super(model);
  }

  /**
   * Finds the last monthly balance for a user and account.
   *
   * @param userId - The user id
   * @param account - The account
   * @param month - The month
   * @param year - The year
   * @returns The last monthly balance
   */
  findMonthlyBalance(
    userId: string,
    account: string,
    month: number,
    year: number,
  ): Promise<IMonthlyBalance | null> {
    return this.Model.findOne({
      user: userId,
      account,
      month,
      year,
    });
  }
}

export default new MonthlyBalanceRepo();
