import sinon from 'sinon';
import { TransactionManager } from '../../../src/server/managers/transactionManager';
import { IMonthlyBalance, ITransaction, TRANSACTION_TYPES, IGoal } from '../../../src/server/types';

describe('TransactionManager', () => {
  let transactionManager: TransactionManager;
  let transactionRepo: any;
  let budgetRepo: any;
  let goalRepo: any;
  let monthlyBalanceRepo: any;
  let transaction: ITransaction;
  let monthlyBalance: IMonthlyBalance;

  beforeEach(() => {
    transaction = {
      name: 'test',
      value: 100,
      type: TRANSACTION_TYPES.TRANSFER,
      date: new Date(),
      category: 'test',
      parentCategory: 'test',
      account: 'test',
      user: 'test',
      goalsList: [],
    };
    monthlyBalance = {
      user: 'test',
      account: 'test',
      month: 1,
      year: 2024,
      openingBalance: 0,
      closingBalance: 0,
      transactions: []
    };
    transactionRepo = {
      save: sinon.stub(),
      findById: sinon.stub(),
      modelName: 'Transaction',
      findByIdAndDelete: sinon.stub(),
      update: sinon.stub(),
    };
    budgetRepo = {
      updateBudgetsByNewTransaction: sinon.stub(),
    };
    goalRepo = {
      incrementGoalsInBulk: sinon.stub(),
    };
    monthlyBalanceRepo = {
      findMonthlyBalance: sinon.stub(),
      save: sinon.stub(),
      update: sinon.stub(),
    };
    transactionManager = new TransactionManager(transactionRepo as any, budgetRepo as any, goalRepo as any, monthlyBalanceRepo as any);
  });

  describe('createContent', () => {
    beforeEach(() => {
      monthlyBalanceRepo.findMonthlyBalance.resolves();
      monthlyBalanceRepo.save.resolves();
      goalRepo.incrementGoalsInBulk.resolves();
      budgetRepo.updateBudgetsByNewTransaction.resolves();
      transactionRepo.save.resolves();
    });

    it('should create a normal transaction and create the monthly balance if it does not exist', async () => {
      transactionRepo.save.resolves(transaction);
      await transactionManager.createContent(transaction);
  
      monthlyBalanceRepo.findMonthlyBalance.should.have.been.calledTwice;
      monthlyBalanceRepo.findMonthlyBalance.should.have.been.calledWith(
        transaction.user,
        transaction.account,
        (transaction.date as Date).getMonth() + 1,
        (transaction.date as Date).getFullYear(),
      );
  
      monthlyBalanceRepo.save.should.have.been.calledOnce;
      goalRepo.incrementGoalsInBulk.should.have.not.been.called;
      budgetRepo.updateBudgetsByNewTransaction.should.have.been.calledOnce;
      transactionRepo.save.should.have.been.calledOnce;
      transactionRepo.save.should.have.been.calledWith(transaction);
    });
  
    it('should create a normal transaction and update the monthly balance if it exists', async () => {
      monthlyBalanceRepo.findMonthlyBalance.resolves(monthlyBalance);
      transactionRepo.save.resolves(transaction);
  
      await transactionManager.createContent(transaction);
  
      monthlyBalanceRepo.findMonthlyBalance.should.have.been.calledOnce;
      monthlyBalanceRepo.update.should.have.been.calledOnce;
      monthlyBalance.transactions.should.have.length(1);
      monthlyBalance.transactions[0].should.deep.equal(transaction);
      monthlyBalance.closingBalance.should.equal(transaction.value);
  
      goalRepo.incrementGoalsInBulk.should.have.not.been.called;
      budgetRepo.updateBudgetsByNewTransaction.should.have.been.calledOnce;
      transactionRepo.save.should.have.been.calledOnce;
      transactionRepo.save.should.have.been.calledWith(transaction);
    });
  
    it('should create a normal transaction and create the monthly balance if it does not exist using the last month', async () => {
      monthlyBalanceRepo.findMonthlyBalance.onFirstCall().resolves();
      monthlyBalanceRepo.findMonthlyBalance.onSecondCall().resolves(monthlyBalance);
      transactionRepo.save.resolves(transaction);
  
      await transactionManager.createContent(transaction);
  
      monthlyBalanceRepo.findMonthlyBalance.should.have.been.calledTwice;
      monthlyBalanceRepo.save.should.have.been.calledOnce;
      monthlyBalanceRepo.save.should.have.been.calledWith({
        user: transaction.user,
        account: transaction.account,
        month: (transaction.date as Date).getMonth() + 1,
        year: (transaction.date as Date).getFullYear(),
        openingBalance: monthlyBalance.closingBalance,
        closingBalance: monthlyBalance.closingBalance + transaction.value,
        transactions: [transaction],
      });
      goalRepo.incrementGoalsInBulk.should.have.not.been.called;
      budgetRepo.updateBudgetsByNewTransaction.should.have.been.calledOnce;
      transactionRepo.save.should.have.been.calledOnce;
      transactionRepo.save.should.have.been.calledWith(transaction);
    });

    it('should create a normal transaction, create the monthly balance if it does not exist using the last month and update goals accordingly', async () => {
      monthlyBalanceRepo.findMonthlyBalance.onFirstCall().resolves();
      monthlyBalanceRepo.findMonthlyBalance.onSecondCall().resolves(monthlyBalance);
      transaction.goalsList = [
        { goal: { id: '1' } as IGoal, goalName: 'test', percentage: 100 },
        { goal: { id: '2' } as IGoal, goalName: 'test', percentage: 200 },
      ];
      transactionRepo.save.resolves(transaction);
  
      await transactionManager.createContent(transaction);
  
      monthlyBalanceRepo.findMonthlyBalance.should.have.been.calledTwice;
      monthlyBalanceRepo.save.should.have.been.calledOnce;
      monthlyBalanceRepo.save.should.have.been.calledWith({
        user: transaction.user,
        account: transaction.account,
        month: (transaction.date as Date).getMonth() + 1,
        year: (transaction.date as Date).getFullYear(),
        openingBalance: monthlyBalance.closingBalance,
        closingBalance: monthlyBalance.closingBalance + transaction.value,
        transactions: [transaction],
      });
      goalRepo.incrementGoalsInBulk.should.have.been.calledOnce;
      goalRepo.incrementGoalsInBulk.should.have.been.calledWith([
        { goalId: transaction.goalsList[0].goal.id, amount: transaction.value * transaction.goalsList[0].percentage },
        { goalId: transaction.goalsList[1].goal.id, amount: transaction.value * transaction.goalsList[1].percentage },
      ]);
      budgetRepo.updateBudgetsByNewTransaction.should.have.been.calledOnce;
      transactionRepo.save.should.have.been.calledOnce;
      transactionRepo.save.should.have.been.calledWith(transaction);
    });
  });

  describe('deleteContent', () => {
    beforeEach(() => {
      monthlyBalanceRepo.findMonthlyBalance.resolves();
      monthlyBalanceRepo.save.resolves();
      goalRepo.incrementGoalsInBulk.resolves();
      budgetRepo.updateBudgetsByNewTransaction.resolves();
      transactionRepo.save.resolves();
      transactionRepo.findByIdAndDelete.resolves();
      transactionRepo.findById.resolves();
    });

    it('should throw an error if the transaction is not found', async () => {
      transactionRepo.findById.resolves(null);

      try {
        await transactionManager.deleteContent('1', '1');
      } catch (error) {
        (error as Error).message.should.equal('Transaction with id 1 not found. Cannot execute delete action.');
      }
    });

    it('should delete a transaction and update the monthly balance', async () => {
      transactionRepo.findById.resolves(transaction);
      monthlyBalanceRepo.findMonthlyBalance.resolves(monthlyBalance);
      transaction.user = 'test';
      monthlyBalance.transactions.push(transaction);

      await transactionManager.deleteContent('1', 'test');

      monthlyBalanceRepo.findMonthlyBalance.should.have.been.calledOnce;
      monthlyBalanceRepo.findMonthlyBalance.should.have.been.calledWith(
        transaction.user,
        transaction.account,
        (transaction.date as Date).getMonth() + 1,
        (transaction.date as Date).getFullYear(),
      );
      monthlyBalanceRepo.update.should.have.been.calledOnce;
      monthlyBalanceRepo.update.should.have.been.calledWith(monthlyBalance.id!, monthlyBalance);
      goalRepo.incrementGoalsInBulk.should.have.not.been.called;
      budgetRepo.updateBudgetsByNewTransaction.should.have.been.calledOnce;
      transactionRepo.findByIdAndDelete.should.have.been.calledOnce;
      transactionRepo.findByIdAndDelete.should.have.been.calledWith('1');
    });

    it('should throw an error if the monthly balance is not found', async () => {
      transaction.id = '1';
      transactionRepo.findById.resolves(transaction);
      monthlyBalanceRepo.findMonthlyBalance.resolves(null);

      try {
        await transactionManager.deleteContent('1', 'test');
      } catch (error) {
        (error as Error).message.should.equal(`Monthly balance for transaction ${transaction.id} not found. Cannot execute subtract action.`);
      }
    });
  });

  describe('updateContent', () => {
    beforeEach(() => {
      monthlyBalanceRepo.findMonthlyBalance.resolves();
      monthlyBalanceRepo.save.resolves();
      goalRepo.incrementGoalsInBulk.resolves();
      budgetRepo.updateBudgetsByNewTransaction.resolves();
      transactionRepo.save.resolves();
      transactionRepo.findById.resolves();
      transactionRepo.update.resolves();
    });

    it('should throw an error if the transaction is not found', async () => {
      transactionRepo.findById.resolves(null);

      try {
        await transactionManager.updateContent('1', transaction, 'test');
      } catch (error) {
        (error as Error).message.should.equal('Transaction with id 1 not found. Cannot execute update action.');
      }
    });

    it('should just update the transaction if not recalculation is needed', async () => {
      transactionRepo.findById.resolves(transaction);
      const updatedTransaction = { name: 'test2' };

      await transactionManager.updateContent('1', updatedTransaction, 'test');

      transactionRepo.update.should.have.been.calledOnce;
      transactionRepo.update.should.have.been.calledWith('1', updatedTransaction);
    });

    it('recalculate all the models if the transaction update requires it', async () => {
      transactionRepo.findById.resolves(transaction);
      monthlyBalanceRepo.findMonthlyBalance.resolves(monthlyBalance);
      transaction.user = 'test';
      monthlyBalance.transactions.push(transaction);
      const updatedTransaction = { value: 200 };

      await transactionManager.updateContent('1', updatedTransaction, 'test');

      monthlyBalanceRepo.update.should.have.been.calledTwice;
      monthlyBalanceRepo.update.should.have.been.calledWith(monthlyBalance.id!, monthlyBalance);
      monthlyBalanceRepo.findMonthlyBalance.should.have.been.calledTwice;
      goalRepo.incrementGoalsInBulk.should.have.not.been.called;
      budgetRepo.updateBudgetsByNewTransaction.should.have.been.calledTwice;
      transactionRepo.update.should.have.been.calledOnce;
      transactionRepo.update.should.have.been.calledWith('1', updatedTransaction);
    });
  });
});
