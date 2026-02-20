import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import {
  ITransaction,
  IMonthlyBalance,
  IGoal,
  TRANSACTION_TYPES,
  INVESTMENT_TYPES,
} from '../../../src/server/types';

chai.use(sinonChai);
chai.should();

const transactionRepoStub = {
  save: sinon.stub(),
  findById: sinon.stub(),
  findByIdAndDelete: sinon.stub(),
  update: sinon.stub(),
  listAll: sinon.stub(),
};

const monthlyBalanceRepoStub = {
  findMonthlyBalance: sinon.stub(),
  save: sinon.stub(),
  update: sinon.stub(),
};

const goalRepoStub = {
  incrementGoalsInBulk: sinon.stub(),
};

const budgetRepoStub = {
  updateBudgetsByNewTransaction: sinon.stub(),
};

const { AccountantManager: AccountantManagerFactory, default: accountantManager } = proxyquire(
  '../../../src/server/managers/accountantManager',
  {
    '../resources/repositories/transactionRepo': { default: transactionRepoStub },
    '../resources/repositories/monthlyBalanceRepo': { default: monthlyBalanceRepoStub },
    '../resources/repositories/goalRepo': { default: goalRepoStub },
    '../resources/repositories/budgetRepo': { default: budgetRepoStub },
  },
);

describe('AccountantManager', () => {
  const mockTransaction: ITransaction = {
    id: 'tx-123',
    name: 'Test Transaction',
    value: 100,
    type: TRANSACTION_TYPES.TRANSFER,
    date: new Date(2024, 0, 15),
    category: 'Food',
    parentCategory: 'Expenses',
    account: 'acc-123',
    user: 'user-123',
    goalsList: [],
  };

  const mockMonthlyBalance: IMonthlyBalance = {
    id: 'mb-123',
    user: 'user-123',
    account: 'acc-123',
    month: 1,
    year: 2024,
    openingBalance: 0,
    closingBalance: 100,
    transactions: [],
  };

  beforeEach(() => {
    transactionRepoStub.save.resetHistory();
    transactionRepoStub.findById.resetHistory();
    transactionRepoStub.findByIdAndDelete.resetHistory();
    transactionRepoStub.update.resetHistory();
    transactionRepoStub.listAll.resetHistory();

    monthlyBalanceRepoStub.findMonthlyBalance.reset();
    monthlyBalanceRepoStub.save.resetHistory();
    monthlyBalanceRepoStub.update.resetHistory();

    goalRepoStub.incrementGoalsInBulk.resetHistory();
    budgetRepoStub.updateBudgetsByNewTransaction.resetHistory();
  });

  describe('getTransactionTypes', () => {
    it('should return transaction types and investment types', () => {
      const result = accountantManager.getTransactionTypes();

      result.should.have.property('transactionTypes');
      result.should.have.property('investmentTypes');
      result.transactionTypes.should.deep.equal(Object.values(TRANSACTION_TYPES));
      result.investmentTypes.should.deep.equal(Object.values(INVESTMENT_TYPES));
    });
  });

  describe('createTransaction', () => {
    beforeEach(() => {
      monthlyBalanceRepoStub.findMonthlyBalance.onFirstCall().resolves(null);
      monthlyBalanceRepoStub.findMonthlyBalance.onSecondCall().resolves(mockMonthlyBalance);
      monthlyBalanceRepoStub.save.resolves();
      goalRepoStub.incrementGoalsInBulk.resolves();
      budgetRepoStub.updateBudgetsByNewTransaction.resolves();
      transactionRepoStub.save.resolves({ ...mockTransaction, id: 'tx-123' });
    });

    it('should create a transaction and update related models', async () => {
      const content = { ...mockTransaction };
      delete content.id;
      transactionRepoStub.save.resolves({ ...content, id: 'tx-123' });

      const result = await accountantManager.createTransaction(content);

      transactionRepoStub.save.should.have.been.calledOnce;
      transactionRepoStub.save.should.have.been.calledWith(content);
      monthlyBalanceRepoStub.findMonthlyBalance.should.have.been.called;
      budgetRepoStub.updateBudgetsByNewTransaction.should.have.been.calledOnce;
      result.should.have.property('id', 'tx-123');
    });

    it('should throw when payload is void', async () => {
      try {
        await accountantManager.createTransaction({} as ITransaction);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('No information provided to create Transaction');
      }
      transactionRepoStub.save.should.not.have.been.called;
    });

    it('should update goals when transaction has goalsList', async () => {
      const content = {
        ...mockTransaction,
        goalsList: [
          { goal: { id: 'goal-1' } as IGoal, goalName: 'Goal 1', percentage: 0.5 },
        ],
      };
      delete content.id;
      transactionRepoStub.save.resolves({ ...content, id: 'tx-123' });

      await accountantManager.createTransaction(content);

      goalRepoStub.incrementGoalsInBulk.should.have.been.calledOnce;
      goalRepoStub.incrementGoalsInBulk.should.have.been.calledWith([
        { goalId: 'goal-1', amount: 50 },
      ]);
    });

    it('should create monthly balance when both current and last month balance do not exist', async () => {
      monthlyBalanceRepoStub.findMonthlyBalance.reset();
      monthlyBalanceRepoStub.findMonthlyBalance.onFirstCall().resolves(null);
      monthlyBalanceRepoStub.findMonthlyBalance.onSecondCall().resolves(null);

      const content = { ...mockTransaction };
      delete content.id;
      transactionRepoStub.save.resolves({ ...content, id: 'tx-123' });

      const result = await accountantManager.createTransaction(content);

      monthlyBalanceRepoStub.findMonthlyBalance.should.have.been.calledTwice;
      monthlyBalanceRepoStub.save.should.have.been.calledOnce;
      monthlyBalanceRepoStub.save.should.have.been.calledWith(
        sinon.match({
          user: content.user,
          account: content.account,
          month: 1,
          year: 2024,
          openingBalance: 0,
          closingBalance: mockTransaction.value,
          transactions: sinon.match.array,
        }),
      );
      result.should.have.property('id', 'tx-123');
    });
  });

  describe('deleteTransaction', () => {
    it('should throw when transaction is not found', async () => {
      transactionRepoStub.findById.resolves(null);

      try {
        await accountantManager.deleteTransaction('tx-999', 'user-123');
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal(
          'Transaction with id tx-999 not found. Cannot execute delete action.',
        );
      }
      transactionRepoStub.findByIdAndDelete.should.not.have.been.called;
    });

    it('should throw when user is not authorized', async () => {
      transactionRepoStub.findById.resolves({ ...mockTransaction, user: 'other-user' });

      try {
        await accountantManager.deleteTransaction('tx-123', 'user-123');
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.include('is not allowed to delete');
      }
    });

    it('should delete transaction and update related models', async () => {
      const monthlyBalanceWithTx = {
        ...mockMonthlyBalance,
        transactions: [mockTransaction],
      };
      monthlyBalanceRepoStub.findMonthlyBalance.reset();
      transactionRepoStub.findById.resolves(mockTransaction);
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(monthlyBalanceWithTx);
      transactionRepoStub.findByIdAndDelete.resolves(mockTransaction);

      const result = await accountantManager.deleteTransaction('tx-123', 'user-123');

      transactionRepoStub.findById.should.have.been.calledWith('tx-123');
      transactionRepoStub.findByIdAndDelete.should.have.been.calledWith('tx-123');
      result.should.deep.equal(mockTransaction);
    });

    it('should allow admin to delete another user transaction', async () => {
      const monthlyBalanceWithTx = {
        ...mockMonthlyBalance,
        transactions: [mockTransaction],
      };
      transactionRepoStub.findById.resolves(mockTransaction);
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(monthlyBalanceWithTx);
      transactionRepoStub.findByIdAndDelete.resolves(mockTransaction);

      await accountantManager.deleteTransaction('tx-123', 'admin-user', true);

      transactionRepoStub.findByIdAndDelete.should.have.been.calledWith('tx-123');
    });

    it('should throw when monthly balance is not found during delete', async () => {
      transactionRepoStub.findById.resolves(mockTransaction);
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(null);

      try {
        await accountantManager.deleteTransaction('tx-123', 'user-123');
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.include(
          'Monthly balance for transaction tx-123 not found',
        );
      }
    });
  });

  describe('updateTransaction', () => {
    it('should throw when payload is void', async () => {
      try {
        await accountantManager.updateTransaction('tx-123', {}, 'user-123');
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('No information provided to update Transaction');
      }
      transactionRepoStub.update.should.not.have.been.called;
    });

    it('should throw when transaction is not found', async () => {
      transactionRepoStub.findById.resolves(null);

      try {
        await accountantManager.updateTransaction('tx-999', { name: 'Updated' }, 'user-123');
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal(
          'Transaction with id tx-999 not found. Cannot execute update action.',
        );
      }
    });

    it('should throw when user is not authorized', async () => {
      transactionRepoStub.findById.resolves({ ...mockTransaction, user: 'other-user' });

      try {
        await accountantManager.updateTransaction('tx-123', { name: 'Updated' }, 'user-123');
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.include('is not allowed to update');
      }
    });

    it('should update transaction without recalculation when payload has no trigger fields', async () => {
      monthlyBalanceRepoStub.findMonthlyBalance.reset();
      transactionRepoStub.findById.resolves(mockTransaction);
      transactionRepoStub.update.resolves({ ...mockTransaction, name: 'Updated' });

      const result = await accountantManager.updateTransaction(
        'tx-123',
        { name: 'Updated' },
        'user-123',
      );

      transactionRepoStub.update.should.have.been.calledOnce;
      transactionRepoStub.update.should.have.been.calledWith('tx-123', { name: 'Updated' });
      monthlyBalanceRepoStub.findMonthlyBalance.should.not.have.been.called;
      result.should.have.property('name', 'Updated');
    });

    it('should trigger recalculation when payload has value field', async () => {
      const monthlyBalanceWithTx = {
        ...mockMonthlyBalance,
        transactions: [mockTransaction],
      };
      monthlyBalanceRepoStub.findMonthlyBalance.reset();
      transactionRepoStub.findById.resolves(mockTransaction);
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(monthlyBalanceWithTx);
      transactionRepoStub.update.resolves({ ...mockTransaction, value: 200 });

      const result = await accountantManager.updateTransaction('tx-123', { value: 200 }, 'user-123');

      transactionRepoStub.update.should.have.been.calledWith('tx-123', { value: 200 });
      chai.expect(result).to.have.property('value', 200);
    });
  });

  describe('getTransaction', () => {
    it('should return null when transaction is not found', async () => {
      transactionRepoStub.findById.resolves(null);

      const result = await accountantManager.getTransaction('tx-999', 'user-123');

      chai.expect(result).to.be.null;
    });

    it('should throw when user is not authorized', async () => {
      transactionRepoStub.findById.resolves({ ...mockTransaction, user: 'other-user' });

      try {
        await accountantManager.getTransaction('tx-123', 'user-123');
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.include('is not allowed to get');
      }
    });

    it('should return transaction when found and user is authorized', async () => {
      transactionRepoStub.findById.resolves(mockTransaction);

      const result = await accountantManager.getTransaction('tx-123', 'user-123');

      transactionRepoStub.findById.should.have.been.calledWith('tx-123');
      result.should.deep.equal(mockTransaction);
    });

    it('should allow admin to get another user transaction', async () => {
      transactionRepoStub.findById.resolves(mockTransaction);

      const result = await accountantManager.getTransaction('tx-123', 'admin-user', true);

      result.should.deep.equal(mockTransaction);
    });
  });

  describe('listTransactions', () => {
    it('should list transactions for user', async () => {
      const transactions = [mockTransaction];
      transactionRepoStub.listAll.resolves(transactions);

      const result = await accountantManager.listTransactions('user-123');

      transactionRepoStub.listAll.should.have.been.calledOnceWith('user-123');
      result.should.deep.equal(transactions);
    });
  });

  describe('AccountantManager factory', () => {
    it('should accept custom repos', async () => {
      const customTransactionRepo = {
        save: sinon.stub().resolves(mockTransaction),
        findById: sinon.stub(),
        findByIdAndDelete: sinon.stub(),
        update: sinon.stub(),
        listAll: sinon.stub(),
      };

      const customManager = AccountantManagerFactory(
        customTransactionRepo as any,
        monthlyBalanceRepoStub as any,
        goalRepoStub as any,
        budgetRepoStub as any,
      );

      monthlyBalanceRepoStub.findMonthlyBalance.onFirstCall().resolves(null);
      monthlyBalanceRepoStub.findMonthlyBalance.onSecondCall().resolves(mockMonthlyBalance);
      monthlyBalanceRepoStub.save.resolves();
      budgetRepoStub.updateBudgetsByNewTransaction.resolves();

      const content = { ...mockTransaction };
      delete content.id;

      await customManager.createTransaction(content);

      customTransactionRepo.save.should.have.been.calledOnce;
    });
  });
});
