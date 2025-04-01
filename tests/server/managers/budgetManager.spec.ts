import { should } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { IBudget } from '../../../src/server/types';

const transactionRepoStub = {
  findByCategoryWithDateRange: sinon.stub().resolves([]),
};
const budgetRepoStub = {
  findById: sinon.stub().resolves({
    id: '1',
    user: '2',
  } as IBudget),
};

const budgetManager = proxyquire('../../../src/server/managers/budgetManager', {
  '../resources/repositories/transactionRepo': { default: transactionRepoStub },
  '../resources/repositories/budgetRepo': { default: budgetRepoStub },
}).default;

describe('Budget manager', () => {
  beforeEach(() => {
    transactionRepoStub.findByCategoryWithDateRange.reset();
    budgetRepoStub.findById.reset();
  });

  it('should calculate the spent value of the budget', async () => {
    transactionRepoStub.findByCategoryWithDateRange.resolves([
      { value: 100 },
      { value: 200 },
      { value: 300 },
      { value: 400 },
    ]);

    try {
      const budget = await budgetManager.calculateSpent({} as IBudget);

      budget.should.equal(1000);
    } catch (error) {
      should().fail((error as Error).message);
    }
  });

  it('should throw an error if the budget is not provided', async () => {
    try {
      await budgetManager.calculateSpent(null);
    } catch (error) {
      should().exist(error);
      (error as Error).message.should.equal('We need a budget to calculate the spent');
    }
  });

  it('should get the budget with the spent value', async () => {
    transactionRepoStub.findByCategoryWithDateRange.resolves([
      { value: 100 },
      { value: 200 },
    ]);
    budgetRepoStub.findById.resolves({
      id: '1',
      user: '2',
    } as IBudget);

    try {
      const budget = await budgetManager.getContent('1', '2');

      budget.spent.should.equal(300);
      budget.id.should.equal('1');
      budget.user.should.equal('2');
      budgetRepoStub.findById.should.have.been.calledWith('1');
    } catch (error) {
      should().fail((error as Error).message);
    }
  });

  it('should throw an error if the budget is not found', async () => {
    budgetRepoStub.findById.resolves(null);

    try {
      await budgetManager.getContent('1', '2');
    } catch (error) {
      should().exist(error);
      (error as Error).message.should.equal('Budget not found');
    }
  });
});
