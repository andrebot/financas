import { should } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { IBudget } from '../../../src/server/types';

const transactionRepoStub = {
  find: sinon.stub().resolves([]),
};
const budgetRepoStub = {
  findOne: sinon.stub().resolves({
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
    transactionRepoStub.find.reset();
    budgetRepoStub.findOne.resetHistory();
  });

  it('should calculate the spent value of the budget', async () => {
    transactionRepoStub.find.resolves([
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
    transactionRepoStub.find.resolves([
      { value: 100 },
      { value: 200 },
    ]);

    try {
      const budget = await budgetManager.getContent('1', '2');

      budget.spent.should.equal(300);
      budget.id.should.equal('1');
      budget.user.should.equal('2');
      budgetRepoStub.findOne.should.have.been.calledWith({
        user: '2',
        id: '1',
      });
    } catch (error) {
      should().fail((error as Error).message);
    }
  });

  it('should throw an error if the budget is not found', async () => {
    budgetRepoStub.findOne.resolves(null);
    try {
      await budgetManager.getContent('1', '2');
    } catch (error) {
      should().exist(error);
      (error as Error).message.should.equal('Budget not found');
    }
  });
});
