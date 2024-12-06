import sinon from 'sinon';
import { BudgetRepo } from '../../../../src/server/resources/repositories/budgetRepo';
import { TRANSACTION_TYPES } from '../../../../src/server/types';

describe('Budget Repository', function () {
  let budgetRepo: BudgetRepo;
  let budgetModel = {
    updateMany: sinon.stub(),
  };

  beforeEach(() => {
    budgetModel.updateMany.reset();
    budgetRepo = new BudgetRepo(budgetModel as any);
  });

  it('should update the budgets by a new transaction', async () => {
    budgetModel.updateMany.resolves();
    const mockTransaction = {
      name: 'test',
      category: 'test',
      parentCategory: 'test',
      account: 'test',
      date: new Date(),
      value: 100,
      type: TRANSACTION_TYPES.TRANSFER,
      user: 'test',
      goalsList: [],
    };

    await budgetRepo.updateBudgetsByNewTransaction(mockTransaction);

    budgetModel.updateMany.should.have.been.calledOnce;
    budgetModel.updateMany.should.have.been.calledWith({
      categories: {
        $in: [mockTransaction.category, mockTransaction.parentCategory],
      },
      startDate: {
        $lte: mockTransaction.date,
      },
      endDate: {
        $gte: mockTransaction.date,
      },
    }, { $inc: { value: mockTransaction.value } });
  });
});
