import sinon from 'sinon';
import { MonthlyBalanceRepo } from '../../../../src/server/resources/repositories/monthlyBalanceRepo';
import { TRANSACTION_TYPES } from '../../../../src/server/types';

describe('MonthlyBalanceRepo', function() {
  let monthlyBalanceRepo: MonthlyBalanceRepo;
  let monthlyBalanceModel = {
    findOne: sinon.stub(),
  };

  beforeEach(function() {
    monthlyBalanceModel.findOne.reset();
    monthlyBalanceRepo = new MonthlyBalanceRepo(monthlyBalanceModel as any);
  });

  it('should find the last monthly balance for a user and account', async function() {
    const userId = '1';
    const account = '1';
    const month = 1;
    const year = 2021;

    monthlyBalanceModel.findOne.resolves({ id: '1' });

    const monthlyBalance = await monthlyBalanceRepo.findMonthlyBalance({
      user: userId,
      account,
      name: 'Test Transaction',
      category: 'Test Category',
      parentCategory: 'Test Parent Category',
      type: TRANSACTION_TYPES.TRANSFER,
      date: new Date(year, month - 1),
      value: 0,
      goalsList: []
    }, new Date(year, month - 1));

    monthlyBalanceModel.findOne.should.have.been.calledOnce;
    monthlyBalanceModel.findOne.should.have.been.calledWith({
      user: userId,
      account,
      month,
      year,
    });
  });
});