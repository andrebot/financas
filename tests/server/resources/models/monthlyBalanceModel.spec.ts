import { should } from 'chai';
import { Types } from 'mongoose';
import MonthlyBalanceModel from '../../../../src/server/resources/models/monthlyBalanceModel';
import { IMonthlyBalanceDocument } from '../../../../src/server/types';
import checkRequiredField from '../../checkRequiredField';

describe('MonthlyBalanceModel', () => {
  let monthlyBalance: IMonthlyBalanceDocument;

  beforeEach(() => {
    monthlyBalance = new MonthlyBalanceModel({
      month: 1,
      year: 2024,
      openingBalance: 100,
      closingBalance: 100,
      transactions: [],
      user: new Types.ObjectId().toString(),
      account: new Types.ObjectId().toString(),
    });
  });

  it('should be invalid if month is empty', () => {
    checkRequiredField(monthlyBalance, 'month');
  });

  it('should be invalid if year is empty', () => {
    checkRequiredField(monthlyBalance, 'year');
  });

  it('should be invalid if openingBalance is empty', () => {
    checkRequiredField(monthlyBalance, 'openingBalance');
  });

  it('should be invalid if closingBalance is empty', () => {
    checkRequiredField(monthlyBalance, 'closingBalance');
  });

  it('should be invalid if user is empty', () => {
    checkRequiredField(monthlyBalance, 'user', 'ObjectId');
  });

  it('should be invalid if account is empty', () => {
    checkRequiredField(monthlyBalance, 'account', 'ObjectId');
  });

  it('should transform the id to string', () => {
    const json = monthlyBalance.toJSON();

    monthlyBalance.id.should.be.a.string;
  });
});
