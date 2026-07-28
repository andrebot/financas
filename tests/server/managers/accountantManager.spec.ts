import { should } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import {
  ITransaction,
  IMonthlyBalance,
  TRANSACTION_TYPES,
  INVESTMENT_TYPES,
} from '../../../src/server/types';

const transactionRepoStub = {
  save: sinon.stub(),
  findById: sinon.stub(),
  deleteById: sinon.stub(),
  update: sinon.stub(),
  listAll: sinon.stub(),
  listAllWithRelations: sinon.stub(),
  findChildTransactions: sinon.stub(),
};

const monthlyBalanceRepoStub = {
  findMonthlyBalance: sinon.stub(),
  save: sinon.stub(),
  updateMonthlyBalanceWithTransaction: sinon.stub(),
  findByYearAndMonth: sinon.stub(),
};

const goalRepoStub = {
  updateGoalFromTransaction: sinon.stub(),
};

const budgetRepoStub = {
  updateBudgetsByNewTransaction: sinon.stub(),
  revertBudgetsByTransaction: sinon.stub(),
};

const investmentRepoStub = {
  save: sinon.stub(),
  findById: sinon.stub(),
  update: sinon.stub(),
  deleteById: sinon.stub(),
  listAll: sinon.stub(),
  saveTransactionLink: sinon.stub(),
  findTransactionLink: sinon.stub(),
  deleteTransactionLink: sinon.stub(),
  saveGoalAllocations: sinon.stub(),
  findGoalAllocations: sinon.stub(),
  applyTransactionToPosition: sinon.stub(),
  recalculatePosition: sinon.stub(),
  archiveInvestment: sinon.stub(),
};

const calculateTaxStub = sinon.stub();

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
    '../resources/repositories/investmentRepo': { default: investmentRepoStub },
    '../engine/taxEngine': { default: calculateTaxStub },
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
    transactionRepoStub.listAllWithRelations.reset();
    transactionRepoStub.findChildTransactions.reset();

    monthlyBalanceRepoStub.findMonthlyBalance.reset();
    monthlyBalanceRepoStub.save.reset();
    monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.reset();
    monthlyBalanceRepoStub.findByYearAndMonth.reset();

    goalRepoStub.updateGoalFromTransaction.reset();
    budgetRepoStub.updateBudgetsByNewTransaction.reset();
    budgetRepoStub.revertBudgetsByTransaction.reset();

    investmentRepoStub.save.reset();
    investmentRepoStub.findById.reset();
    investmentRepoStub.update.reset();
    investmentRepoStub.deleteById.reset();
    investmentRepoStub.listAll.reset();
    investmentRepoStub.saveTransactionLink.reset();
    investmentRepoStub.findTransactionLink.reset();
    investmentRepoStub.deleteTransactionLink.reset();
    investmentRepoStub.saveGoalAllocations.reset();
    investmentRepoStub.applyTransactionToPosition.reset();
    investmentRepoStub.recalculatePosition.reset();
    investmentRepoStub.archiveInvestment.reset();

    calculateTaxStub.reset();
    calculateTaxStub.returns(0);

    investmentRepoStub.saveTransactionLink.resolves();
    investmentRepoStub.applyTransactionToPosition.resolves();
    investmentRepoStub.findTransactionLink.resolves(null);
    investmentRepoStub.deleteTransactionLink.resolves();
    investmentRepoStub.recalculatePosition.resolves();
    investmentRepoStub.archiveInvestment.resolves();

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
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(mockMonthlyBalance);
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.resolves();
      goalRepoStub.updateGoalFromTransaction.resolves();
      budgetRepoStub.updateBudgetsByNewTransaction.resolves();
    });

    it('should save the transaction and update monthly balance for inflow types', async () => {
      const content = buildTransaction({ id: undefined as unknown as number });

      const result = await accountantManager.createTransaction(content);

      transactionRepoStub.save.should.have.been.calledOnce;
      monthlyBalanceRepoStub.findMonthlyBalance.should.have.been.called;
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.should.have.been.calledOnce;
      budgetRepoStub.updateBudgetsByNewTransaction.should.not.have.been.called;
      result.should.deep.equal(mockTransaction);
    });

    it('should update budget for outflow types', async () => {
      const outflowContent = buildTransaction({
        id: undefined as unknown as number, type: 'cardPurchase',
      });
      const savedOutflow = { ...outflowContent, id: 2 };
      transactionRepoStub.save.resolves(savedOutflow);

      await accountantManager.createTransaction(outflowContent);

      budgetRepoStub.updateBudgetsByNewTransaction.should.have.been.calledOnce;
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

    it('should store the raw negative value in totalIn when type is inflow and value is negative', async () => {
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
      savedBalance.should.have.property('totalIn', '-50');
      savedBalance.should.have.property('totalOut', '0');
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

    it('should save a negative closingDelta when transaction type is outflow', async () => {
      const outflowTxn = buildTransaction({ id: undefined as unknown as number, type: 'cardPurchase', value: '100.00' });
      const savedOutflow = { ...outflowTxn, id: 2 };
      transactionRepoStub.save.resolves(savedOutflow);
      monthlyBalanceRepoStub.findMonthlyBalance.reset();
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(null);
      monthlyBalanceRepoStub.save.resolves();

      await accountantManager.createTransaction(outflowTxn);

      monthlyBalanceRepoStub.save.should.have.been.calledOnce;
      const savedBalance = monthlyBalanceRepoStub.save.firstCall.args[0];
      savedBalance.should.have.property('totalOut', '100');
      savedBalance.should.have.property('totalIn', '0');
    });
  });

  describe('deleteTransaction', () => {
    beforeEach(() => {
      transactionRepoStub.findById.resolves(mockTransaction);
      transactionRepoStub.deleteById.resolves(mockTransaction);
      transactionRepoStub.findChildTransactions.resolves([]);
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.resolves();
      goalRepoStub.updateGoalFromTransaction.resolves();
      budgetRepoStub.revertBudgetsByTransaction.resolves();
    });

    it('should revert monthly balance and delete the transaction', async () => {
      const result = await accountantManager.deleteTransaction(1);

      transactionRepoStub.findById.should.have.been.calledOnceWith(1);
      transactionRepoStub.findChildTransactions.should.have.been.calledOnceWith(1);
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.should.have.been.calledOnceWith(
        mockTransaction, true,
      );
      transactionRepoStub.deleteById.should.have.been.calledOnceWith(1);
      result.should.deep.equal(mockTransaction);
    });

    it('should revert budget for outflow types on delete', async () => {
      const outflowTx = buildTransaction({ type: 'cardPurchase' });
      transactionRepoStub.findById.resolves(outflowTx);
      transactionRepoStub.deleteById.resolves(outflowTx);

      await accountantManager.deleteTransaction(1);

      budgetRepoStub.revertBudgetsByTransaction.should.have.been.calledOnceWith(outflowTx);
    });

    it('should delete child transactions before deleting the parent', async () => {
      const childTx = buildTransaction({ id: 99, type: 'investmentTax' });
      transactionRepoStub.findChildTransactions.resolves([childTx]);
      transactionRepoStub.deleteById.resolves(mockTransaction);

      await accountantManager.deleteTransaction(1);

      transactionRepoStub.deleteById.should.have.been.calledWith(99);
      transactionRepoStub.deleteById.should.have.been.calledWith(1);
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
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.resolves();
      goalRepoStub.updateGoalFromTransaction.resolves();
      budgetRepoStub.updateBudgetsByNewTransaction.resolves();
      budgetRepoStub.revertBudgetsByTransaction.resolves();
    });

    it('should throw when payload is void', async () => {
      try {
        await accountantManager.updateTransaction(1, {});
        should().fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('No information provided to update Transaction');
      }
      transactionRepoStub.update.should.not.have.been.called;
    });

    it('should throw when transaction is not found', async () => {
      transactionRepoStub.findById.resolves(null);

      try {
        await accountantManager.updateTransaction(999, { name: 'X' });
        should().fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal(
          'Transaction with id 999 not found. Cannot execute update action.',
        );
      }
    });

    it('should update without recalculation when payload has no trigger fields', async () => {
      const result = await accountantManager.updateTransaction(1, { name: 'Updated' });

      transactionRepoStub.update.should.have.been.calledOnceWith(1, { name: 'Updated' });
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.should.not.have.been.called;
      result.should.have.property('name', 'Updated');
    });

    it('should trigger recalculation when a recalculation field changes', async () => {
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(mockMonthlyBalance);

      const result = await accountantManager.updateTransaction(1, { value: '200.00' });

      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.should.have.been.calledWith(
        mockTransaction, true,
      );
      transactionRepoStub.update.should.have.been.calledOnce;
      (result as ITransaction).should.have.property('name', 'Updated');
    });

    it('should revert and update budget for outflow type on recalculation', async () => {
      const outflowTx = buildTransaction({ type: 'cardPurchase' });
      const updatedOutflow = { ...outflowTx, value: '200.00' };
      transactionRepoStub.findById.resolves(outflowTx);
      transactionRepoStub.update.resolves(updatedOutflow);
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(mockMonthlyBalance);

      await accountantManager.updateTransaction(1, { value: '200.00' });

      budgetRepoStub.revertBudgetsByTransaction.should.have.been.calledOnce;
      budgetRepoStub.updateBudgetsByNewTransaction.should.have.been.calledOnce;
    });

    it('should throw when trying to change an investment transaction type', async () => {
      const investmentTx = buildTransaction({ type: 'investmentBuy' });
      transactionRepoStub.findById.resolves(investmentTx);

      try {
        await accountantManager.updateTransaction(1, { type: 'investmentSell' });
        should().fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.include('Cannot change the type of an investment transaction');
      }
    });

    it('should update recalculated transaction content inside the same transaction', async () => {
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(mockMonthlyBalance);
      transactionRepoStub.update.callsFake(async () => {
        should().equal(transactionDepth, 1);

        return { ...mockTransaction, value: '200.00' };
      });

      await accountantManager.updateTransaction(1, { value: '200.00' });

      transactionRepoStub.update.should.have.been.calledOnceWith(1, { value: '200.00' });
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
    it('should return all transactions with relations', async () => {
      const transactions = [{ ...mockTransaction, accountName: 'Checking', categoryName: 'Food' }];
      transactionRepoStub.listAllWithRelations.resolves(transactions);

      const result = await accountantManager.listTransactions();

      transactionRepoStub.listAllWithRelations.should.have.been.calledOnce;
      result.should.deep.equal(transactions);
    });
  });

  describe('listMonthlyBalances', () => {
    it('should return monthly balances for the given year and month', async () => {
      const balances = [mockMonthlyBalance];
      monthlyBalanceRepoStub.findByYearAndMonth.resolves(balances);

      const result = await accountantManager.listMonthlyBalances(2026, 6);

      monthlyBalanceRepoStub.findByYearAndMonth.should.have.been.calledOnceWith(2026, 6);
      result.should.deep.equal(balances);
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
      };

      const customManager = AccountantManagerFactory({
        transactionRepo: customTransactionRepo as any,
        monthlyBalanceRepo: monthlyBalanceRepoStub as any,
        goalRepo: goalRepoStub as any,
        budgetRepo: budgetRepoStub as any,
        investmentRepo: investmentRepoStub as any,
      });

      monthlyBalanceRepoStub.findMonthlyBalance.resolves(mockMonthlyBalance);
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.resolves();
      goalRepoStub.updateGoalFromTransaction.resolves();
      budgetRepoStub.updateBudgetsByNewTransaction.resolves();

      const content = buildTransaction({ id: undefined as unknown as number });
      await customManager.createTransaction(content);

      customTransactionRepo.save.should.have.been.calledOnce;
    });
  });

  describe('investment transaction support', () => {
    const mockInvestmentEntry = { investment: { id: 5 } };

    beforeEach(() => {
      transactionRepoStub.save.resolves(mockTransaction);
      transactionRepoStub.findChildTransactions.resolves([]);
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(mockMonthlyBalance);
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.resolves();
      goalRepoStub.updateGoalFromTransaction.resolves();
      budgetRepoStub.updateBudgetsByNewTransaction.resolves();
      budgetRepoStub.revertBudgetsByTransaction.resolves();
    });

    it('should link and position-update the investment when investmentEntry is provided on create', async () => {
      const content = buildTransaction({ id: undefined as unknown as number });

      await accountantManager.createTransaction(content, mockInvestmentEntry as any);

      investmentRepoStub.saveTransactionLink.should.have.been.calledOnceWith(
        mockTransaction.id, 5, undefined, undefined,
      );
      investmentRepoStub.applyTransactionToPosition.should.have.been.calledOnce;
    });

    it('should create a tax transaction when investmentDueDate yields taxable income', async () => {
      const investment = {
        id: 5,
        name: 'CDB',
        investmentType: 'cdb',
        totalInvested: '1000.00',
        createdAt: new Date(2023, 0, 1),
      };
      const dueDate = buildTransaction({
        type: 'investmentDueDate', value: '1100.00', date: new Date(2024, 0, 1),
      });
      const taxTx = { ...dueDate, id: 99, type: 'investmentTax', value: '150' };

      transactionRepoStub.save.onFirstCall().resolves(dueDate);
      transactionRepoStub.save.onSecondCall().resolves(taxTx);
      investmentRepoStub.findById.resolves(investment);
      calculateTaxStub.returns(150);

      const content = buildTransaction({ id: undefined as unknown as number });
      await accountantManager.createTransaction(content, mockInvestmentEntry as any);

      transactionRepoStub.save.should.have.been.calledTwice;
      monthlyBalanceRepoStub.updateMonthlyBalanceWithTransaction.should.have.been.calledWith(
        taxTx, false,
      );
    });

    it('should set parentTransactionId on the tax transaction', async () => {
      const investment = {
        id: 5,
        name: 'CDB',
        investmentType: 'cdb',
        totalInvested: '1000.00',
        createdAt: new Date(2023, 0, 1),
      };
      const dueDate = buildTransaction({
        id: 10,
        type: 'investmentDueDate', value: '1100.00', date: new Date(2024, 0, 1),
      });
      transactionRepoStub.save.onFirstCall().resolves(dueDate);
      transactionRepoStub.save.onSecondCall().resolves({ ...dueDate, id: 99, type: 'investmentTax' });
      investmentRepoStub.findById.resolves(investment);
      calculateTaxStub.returns(150);

      const content = buildTransaction({ id: undefined as unknown as number });
      await accountantManager.createTransaction(content, mockInvestmentEntry as any);

      const taxPayload = transactionRepoStub.save.secondCall.args[0];
      taxPayload.should.have.property('parentTransactionId', 10);
    });

    it('should not touch investment repo when no investmentEntry on create', async () => {
      const content = buildTransaction({ id: undefined as unknown as number });

      await accountantManager.createTransaction(content);

      investmentRepoStub.saveTransactionLink.should.not.have.been.called;
      investmentRepoStub.applyTransactionToPosition.should.not.have.been.called;
    });

    it('should find, pre-delete and recalculate position on delete when link exists', async () => {
      const link = { transactionId: 1, investmentId: 5, quantity: null, unitPrice: null };
      investmentRepoStub.findTransactionLink.resolves(link);
      transactionRepoStub.findById.resolves(mockTransaction);
      transactionRepoStub.deleteById.resolves(mockTransaction);

      await accountantManager.deleteTransaction(1);

      investmentRepoStub.findTransactionLink.should.have.been.calledOnceWith(mockTransaction.id);
      investmentRepoStub.deleteTransactionLink.should.have.been.calledOnceWith(mockTransaction.id);
      investmentRepoStub.recalculatePosition.should.have.been.calledOnceWith(5);
    });

    it('should skip investment revert on delete when no link exists', async () => {
      investmentRepoStub.findTransactionLink.resolves(null);
      transactionRepoStub.findById.resolves(mockTransaction);
      transactionRepoStub.deleteById.resolves(mockTransaction);

      await accountantManager.deleteTransaction(1);

      investmentRepoStub.deleteTransactionLink.should.not.have.been.called;
      investmentRepoStub.recalculatePosition.should.not.have.been.called;
    });

    it('should revert and reapply investment position on update with recalculation', async () => {
      const link = { transactionId: 1, investmentId: 5, quantity: null, unitPrice: null };
      investmentRepoStub.findTransactionLink.resolves(link);
      transactionRepoStub.findById.resolves(mockTransaction);
      transactionRepoStub.update.resolves({ ...mockTransaction, value: '200.00' });
      monthlyBalanceRepoStub.findMonthlyBalance.resolves(mockMonthlyBalance);

      await accountantManager.updateTransaction(1, { value: '200.00' }, mockInvestmentEntry as any);

      investmentRepoStub.deleteTransactionLink.should.have.been.calledOnce;
      investmentRepoStub.recalculatePosition.should.have.been.calledOnceWith(5);
      investmentRepoStub.saveTransactionLink.should.have.been.calledOnce;
      investmentRepoStub.applyTransactionToPosition.should.have.been.calledOnce;
    });

    it('should update monthly balance for investment types using goal rules', async () => {
      const buyTx = buildTransaction({ type: 'investmentBuy', value: '500.00' });
      transactionRepoStub.save.resolves(buyTx);

      const content = buildTransaction({ id: undefined as unknown as number, type: 'investmentBuy' });
      await accountantManager.createTransaction(content, mockInvestmentEntry as any);

      goalRepoStub.updateGoalFromTransaction.should.have.been.calledOnceWith(buyTx, false);
      budgetRepoStub.updateBudgetsByNewTransaction.should.not.have.been.called;
    });

    it('should create the investment inline when no id is provided in the entry', async () => {
      const createdInvestment = { id: 42, name: 'New CDB', investmentType: 'cdb' };
      investmentRepoStub.save.resolves(createdInvestment);

      const inlineEntry = { investment: { name: 'New CDB', investmentType: 'cdb' } };
      const content = buildTransaction({ id: undefined as unknown as number });

      await accountantManager.createTransaction(content, inlineEntry as any);

      investmentRepoStub.save.should.have.been.calledOnceWith({
        name: 'New CDB',
        investmentType: 'cdb',
        totalInvested: '0',
        archived: false,
      });
      investmentRepoStub.saveTransactionLink.should.have.been.calledOnceWith(
        mockTransaction.id, 42, undefined, undefined,
      );
    });

    it('should save goal allocations when goals are provided in the entry', async () => {
      const entryWithGoals = {
        investment: { id: 5 },
        goals: [{ goalId: 1, percentage: 50 }],
      };

      const content = buildTransaction({ id: undefined as unknown as number });
      await accountantManager.createTransaction(content, entryWithGoals as any);

      investmentRepoStub.saveGoalAllocations.should.have.been.calledOnceWith(
        5, entryWithGoals.goals,
      );
    });
  });

  describe('investment CRUD', () => {
    const mockInvestment = {
      id: 1, name: 'CDB Nubank', investmentType: 'cdb', totalInvested: '1000.00', archived: false,
    };

    it('createInvestment should delegate to investmentRepo.save', async () => {
      investmentRepoStub.save.resolves(mockInvestment);

      await accountantManager.createInvestment({ name: 'CDB Nubank' } as any);

      investmentRepoStub.save.should.have.been.calledOnce;
    });

    it('getInvestment should delegate to investmentRepo.findById', async () => {
      investmentRepoStub.findById.resolves(mockInvestment);

      await accountantManager.getInvestment(1);

      investmentRepoStub.findById.should.have.been.calledOnceWith(1);
    });

    it('updateInvestment should delegate to investmentRepo.update', async () => {
      investmentRepoStub.update.resolves(mockInvestment);

      await accountantManager.updateInvestment(1, { name: 'Updated' } as any);

      investmentRepoStub.update.should.have.been.calledOnceWith(1, { name: 'Updated' });
    });

    it('deleteInvestment should delegate to investmentRepo.deleteById', async () => {
      investmentRepoStub.deleteById.resolves(mockInvestment);

      await accountantManager.deleteInvestment(1);

      investmentRepoStub.deleteById.should.have.been.calledOnceWith(1);
    });

    it('listInvestments should delegate to investmentRepo.listAll', async () => {
      investmentRepoStub.listAll.resolves([mockInvestment]);

      await accountantManager.listInvestments();

      investmentRepoStub.listAll.should.have.been.calledOnce;
    });
  });
});
