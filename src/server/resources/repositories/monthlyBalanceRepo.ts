import { Model, Types } from 'mongoose';
import MonthlyBalanceModel, { IMonthlyBalanceDocument } from '../models/monthlyBalanceModel';
import Repository from './repository';
import { IMonthlyBalance, ITransaction } from '../../types';

export class MonthlyBalanceRepo extends Repository<IMonthlyBalanceDocument, IMonthlyBalance> {
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
    transaction: ITransaction,
    date: Date,
  ): Promise<IMonthlyBalance | null> {

    return this.Model.findOne({
      user: transaction.user,
      account: transaction.account,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });
  }
}

export default new MonthlyBalanceRepo();
