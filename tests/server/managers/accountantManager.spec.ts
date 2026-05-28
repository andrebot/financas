import { should } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import {
  ITransaction,
  IMonthlyBalance,
  TRANSACTION_TYPES,
  INVESTMENT_TYPES,
  ITransactionGoalEntry,
} from '../../../src/server/types';

const transactionRepoStub = {
  save: sinon.stub(),
  findById: sinon.stub(),
  deleteById: sinon.stub(),
  update: sinon.stub(),
  listAll: sinon.stub(),
  deleteTransactionFromGoals: sinon.stub(),
  saveTransactionGoals: sinon.stub(),
};

const monthlyBalanceRepoStub = {
  findMonthlyBalance: sinon.stub(),
  save: sinon.stub(),
  updateMonthlyBalanceWithTransaction: sinon.stub(),
};

const goalRepoStub = {
  updateGoalFromTransaction: sinon.stub(),
};

const budgetRepoStub = {
  updateBudgetsByNewTransaction: sinon.stub(),
  revertBudgetsByTransaction: sinon.stub(),
};

let transactionDepth = 0;

/**
 * Runs a callback while exposing whether repository calls are inside a transaction.
 *
 * @param fn - The callback to execute inside the fake transaction scope.
 * @returns The callback result.
 */
async function withTransactionStub<T>(fn: () => Promise<T>): Promise<T> {
  transactionDepth += 1;
  try {
    return await fn();
  } finally {
    transactionDepth -= 1;
  }
}

const { AccountantManager: AccountantManagerFactory, default: accountantManager } = proxyquire(
  '../../../src/server/managers/accountantManager',
  {
    '../resources/repositories/transactionRepo': { default: transactionRepoStub },
    '../resources/repositories/monthlyBalanceRepo': { default: monthlyBalanceRepoStub },
    '../resources/repositories/goalRepo': { default: goalRepoStub },
    '../resources/repositories/budgetRepo': { default: budgetRepoStub },
    '../utils/transaction': { withTransaction: withTransactionStub },
  },
);

describe('AccountantManager', () => {
  function buildTransaction(overrides: Partial<ITransaction> = {}): ITransaction {
    return {
      id: 1,
      name: 'Test Transaction',
      categoryId: 5,
      accountId: 3,
      type: 'transferIn',
      date: new Date(2024, 0, 15),
      value: '100.00',
      investmentType: null,
      userId: 1,
      createdAt: new Date(),
      updatedAt: null,
      ...overrides,
    } as ITransaction;
  }

  function buildMonthlyBalance(overrides: Partial<IMonthlyBalance> = {}): IMonthlyBalance {
    return {
      id: 1,
      accountId: 3,
      month: 1,
      year: 2024,
      openingBalance: '0.00',
      closingBalance: '100.00',
      totalIn: '100.00',
      totalOut: '0.00',
      createdAt: new Date(),
      updatedAt: null,
      ...overrides,
    } as IMonthlyBalance;
  }

  const mockTransaction = buildTransaction();
  const mockMonthlyBalance = buildMonthlyBalance();

  beforeEach(() => {
    transactionRepoStub.save.reset();
    transactionRepoStub.findById.reset();
    transactionRepoStub.deleteById.reset();
    transactionRepoStub.update.reset();
    transactionRepoStub.listAll.reset();
    transactionRepoStub.deleteTransactionFromGoals.reset();
    transactionRepoStub.saveTransactionGoals.reset();

    monthlyBalanceRepoStub.findMonthlyBalance.reset();
    monthlyBalanceRepoStub.save.reset();
    monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.reset();

    goalRepoStub.updateGoalFromTransaction.reset();
    budgetRepoStub.updateBudgetsByNewTransaction.reset();
    budgetRepoStub.revertBudgetsByTransaction.reset();
    transactionDepth = 0;
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
      transactionRepoStub.save.resolves(mockTransaction);
      transactionRepoStub.saveTransactionGoals.resolves();
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(mockMonthlyBalance);
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.resolves();
      goalRepoStub.updateGoalFromTransaction.resolves();
      budgetRepoStub.updateBudgetsByNewTransaction.resolves();
    });

    it('should save the transaction and update related models', async () => {
      const content = buildTransaction({ id: undefined as unknown as number });

      const result = await accountantManager.createTransaction(content);

      transactionRepoStub.save.should.have.been.calledOnce;
      transactionRepoStub.saveTransactionGoals.should.have.been.calledOnce;
      monthlyBalanceRepoStub.findMonthlyBalance.should.have.been.called;
      budgetRepoStub.updateBudgetsByNewTransaction.should.have.been.calledOnce;
      result.should.deep.equal(mockTransaction);
    });

    it('should save goal junction rows when goals are provided', async () => {
      const goals: ITransactionGoalEntry[] = [
        { goalId: 10, percentage: 0.5 },
        { goalId: 11, percentage: 0.5 },
      ];
      const content = buildTransaction({ id: undefined as unknown as number });

      await accountantManager.createTransaction(content, goals);

      transactionRepoStub.saveTransactionGoals.should.have.been.calledOnce;
      transactionRepoStub.saveTransactionGoals.should.have.been.calledWith(
        mockTransaction.id,
        goals,
      );
    });

    it('should throw when payload is void', async () => {
      try {
        await accountantManager.createTransaction({} as ITransaction);
        should().fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('No information provided to create Transaction');
      }
      transactionRepoStub.save.should.not.have.been.called;
    });

    it('should create a new monthly balance when none exists for the month', async () => {
      monthlyBalanceRepoStub.findMonthlyBalance.reset();
      monthlyBalanceRepoStub.findMonthlyBalance.onFirstCall().resolves(null);
      monthlyBalanceRepoStub.findMonthlyBalance.onSecondCall().resolves(null);
      monthlyBalanceRepoStub.save.resolves();

      const content = buildTransaction({ id: undefined as unknown as number });

      await accountantManager.createTransaction(content);

      monthlyBalanceRepoStub.findMonthlyBalance.should.have.been.calledTwice;
      monthlyBalanceRepoStub.save.should.have.been.calledOnce;
      const savedBalance = monthlyBalanceRepoStub.save.firstCall.args[0];
      savedBalance.should.have.property('accountId', content.accountId);
      savedBalance.should.have.property('month', 1);
      savedBalance.should.have.property('year', 2024);
    });

    it('should use last month closing balance as opening balance when it exists', async () => {
      const lastMonthBalance = buildMonthlyBalance({ closingBalance: '250.00' });
      monthlyBalanceRepoStub.findMonthlyBalance.reset();
      monthlyBalanceRepoStub.findMonthlyBalance.onFirstCall().resolves(null);
      monthlyBalanceRepoStub.findMonthlyBalance.onSecondCall().resolves(lastMonthBalance);
      monthlyBalanceRepoStub.save.resolves();

      const content = buildTransaction({ id: undefined as unknown as number });

      await accountantManager.createTransaction(content);

      monthlyBalanceRepoStub.save.should.have.been.calledOnce;
      const savedBalance = monthlyBalanceRepoStub.save.firstCall.args[0];
      savedBalance.should.have.property('openingBalance', '250');
    });

    it('should set totalOut and zero totalIn when transaction value is negative', async () => {
      const negativeTxn = buildTransaction({ value: '-50.00' });
      transactionRepoStub.save.resolves(negativeTxn);
      monthlyBalanceRepoStub.findMonthlyBalance.reset();
      monthlyBalanceRepoStub.findMonthlyBalance.onFirstCall().resolves(null);
      monthlyBalanceRepoStub.findMonthlyBalance.onSecondCall().resolves(null);
      monthlyBalanceRepoStub.save.resolves();

      const content = buildTransaction({ id: undefined as unknown as number, value: '-50.00' });

      await accountantManager.createTransaction(content);

      monthlyBalanceRepoStub.save.should.have.been.calledOnce;
      const savedBalance = monthlyBalanceRepoStub.save.firstCall.args[0];
      savedBalance.should.have.property('totalIn', '0');
      savedBalance.should.have.property('totalOut', '50');
    });

    it('should update an existing monthly balance when one already exists', async () => {
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(mockMonthlyBalance);

      const content = buildTransaction({ id: undefined as unknown as number });

      await accountantManager.createTransaction(content);

      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.should.have.been.calledOnce;
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.should.have.been.calledWith(
        mockTransaction,
        false,
      );
      monthlyBalanceRepoStub.save.should.not.have.been.called;
    });
  });

  describe('deleteTransaction', () => {
    beforeEach(() => {
      transactionRepoStub.findById.resolves(mockTransaction);
      transactionRepoStub.deleteById.resolves(mockTransaction);
      transactionRepoStub.deleteTransactionFromGoals.resolves(0);
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.resolves();
      goalRepoStub.updateGoalFromTransaction.resolves();
      budgetRepoStub.revertBudgetsByTransaction.resolves();
    });

    it('should revert related models and delete the transaction', async () => {
      const result = await accountantManager.deleteTransaction(1);

      transactionRepoStub.findById.should.have.been.calledOnceWith(1);
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.should.have.been.calledOnceWith(
        mockTransaction, true,
      );
      goalRepoStub.updateGoalFromTransaction.should.have.been.calledOnceWith(mockTransaction, true);
      budgetRepoStub.revertBudgetsByTransaction.should.have.been.calledOnceWith(mockTransaction);
      transactionRepoStub.deleteTransactionFromGoals.should.have.been.calledOnceWith(1);
      transactionRepoStub.deleteById.should.have.been.calledOnceWith(1);
      result.should.deep.equal(mockTransaction);
    });

    it('should throw when transaction is not found', async () => {
      transactionRepoStub.findById.resolves(null);

      try {
        await accountantManager.deleteTransaction(999);
        should().fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal(
          'Transaction with id 999 not found. Cannot execute delete action.',
        );
      }
      transactionRepoStub.deleteById.should.not.have.been.called;
    });
  });

  describe('updateTransaction', () => {
    beforeEach(() => {
      transactionRepoStub.findById.resolves(mockTransaction);
      transactionRepoStub.update.resolves({ ...mockTransaction, name: 'Updated' });
      transactionRepoStub.deleteTransactionFromGoals.resolves(0);
      transactionRepoStub.saveTransactionGoals.resolves();
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.resolves();
      goalRepoStub.updateGoalFromTransaction.resolves();
      budgetRepoStub.updateBudgetsByNewTransaction.resolves();
      budgetRepoStub.revertBudgetsByTransaction.resolves();
    });

    it('should throw when payload is void', async () => {
      try {
        await accountantManager.updateTransaction(1, {}, undefined);
        should().fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('No information provided to update Transaction');
      }
      transactionRepoStub.update.should.not.have.been.called;
    });

    it('should throw when transaction is not found', async () => {
      transactionRepoStub.findById.resolves(null);

      try {
        await accountantManager.updateTransaction(999, { name: 'X' }, undefined);
        should().fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal(
          'Transaction with id 999 not found. Cannot execute update action.',
        );
      }
    });

    it('should update without recalculation when payload has no trigger fields', async () => {
      const result = await accountantManager.updateTransaction(1, { name: 'Updated' }, undefined);

      transactionRepoStub.update.should.have.been.calledOnceWith(1, { name: 'Updated' });
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.should.not.have.been.called;
      result.should.have.property('name', 'Updated');
    });

    it('should trigger recalculation when a recalculation field changes', async () => {
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(mockMonthlyBalance);

      const result = await accountantManager.updateTransaction(
        1, { value: '200.00' }, undefined,
      );

      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.should.have.been.calledWith(
        mockTransaction, true,
      );
      budgetRepoStub.revertBudgetsByTransaction.should.have.been.calledOnce;
      budgetRepoStub.updateBudgetsByNewTransaction.should.have.been.calledOnce;
      transactionRepoStub.update.should.have.been.calledOnce;
      (result as ITransaction).should.have.property('name', 'Updated');
    });

    it('should update recalculated transaction content inside the same transaction', async () => {
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(mockMonthlyBalance);
      transactionRepoStub.update.callsFake(async () => {
        should().equal(transactionDepth, 1);

        return { ...mockTransaction, value: '200.00' };
      });

      await accountantManager.updateTransaction(1, { value: '200.00' }, undefined);

      transactionRepoStub.update.should.have.been.calledOnceWith(1, { value: '200.00' });
    });

    it('should replace goal associations when recalculating with goals provided', async () => {
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(mockMonthlyBalance);
      const goals: ITransactionGoalEntry[] = [{ goalId: 5, percentage: 1 }];

      await accountantManager.updateTransaction(1, { value: '200.00' }, goals);

      transactionRepoStub.deleteTransactionFromGoals.should.have.been.calledOnceWith(1);
      transactionRepoStub.saveTransactionGoals.should.have.been.calledOnceWith(1, goals);
    });

    it('should not touch goal junction rows when recalculating without goals', async () => {
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(mockMonthlyBalance);

      await accountantManager.updateTransaction(1, { value: '200.00' }, undefined);

      transactionRepoStub.deleteTransactionFromGoals.should.not.have.been.called;
      transactionRepoStub.saveTransactionGoals.should.not.have.been.called;
    });

    it('should update only goal associations when no recalculation fields change', async () => {
      const goals: ITransactionGoalEntry[] = [{ goalId: 7, percentage: 1 }];

      await accountantManager.updateTransaction(1, { name: 'Updated' }, goals);

      goalRepoStub.updateGoalFromTransaction.should.have.been.calledWith(mockTransaction, true);
      transactionRepoStub.deleteTransactionFromGoals.should.have.been.calledOnceWith(1);
      transactionRepoStub.saveTransactionGoals.should.have.been.calledOnceWith(1, goals);
      goalRepoStub.updateGoalFromTransaction.should.have.been.calledTwice;
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.should.not.have.been.called;
    });
  });

  describe('getTransaction', () => {
    it('should return the transaction when found', async () => {
      transactionRepoStub.findById.resolves(mockTransaction);

      const result = await accountantManager.getTransaction(1);

      transactionRepoStub.findById.should.have.been.calledOnceWith(1);
      result.should.deep.equal(mockTransaction);
    });

    it('should return null when transaction is not found', async () => {
      transactionRepoStub.findById.resolves(null);

      const result = await accountantManager.getTransaction(999);

      should().not.exist(result);
    });
  });

  describe('listTransactions', () => {
    it('should return all transactions', async () => {
      const transactions = [mockTransaction];
      transactionRepoStub.listAll.resolves(transactions);

      const result = await accountantManager.listTransactions();

      transactionRepoStub.listAll.should.have.been.calledOnce;
      result.should.deep.equal(transactions);
    });
  });

  describe('AccountantManager factory', () => {
    it('should accept custom repos', async () => {
      const customTransactionRepo = {
        save: sinon.stub().resolves(mockTransaction),
        findById: sinon.stub(),
        deleteById: sinon.stub(),
        update: sinon.stub(),
        listAll: sinon.stub(),
        deleteTransactionFromGoals: sinon.stub().resolves(0),
        saveTransactionGoals: sinon.stub().resolves(),
      };

      const customManager = AccountantManagerFactory(
        customTransactionRepo as any,
        monthlyBalanceRepoStub as any,
        goalRepoStub as any,
        budgetRepoStub as any,
      );

      monthlyBalanceRepoStub.findMonthlyBalance.resolves(mockMonthlyBalance);
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.resolves();
      goalRepoStub.updateGoalFromTransaction.resolves();
      budgetRepoStub.updateBudgetsByNewTransaction.resolves();

      const content = buildTransaction({ id: undefined as unknown as number });
      await customManager.createTransaction(content);

      customTransactionRepo.save.should.have.been.calledOnce;
    });
  });
});
