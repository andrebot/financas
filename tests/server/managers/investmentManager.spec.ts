import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import type { ITransaction, IInvestmentTransactionEntry } from '../../../src/server/types';

chai.use(sinonChai);
chai.should();

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

const { applyInvestmentTransaction, revertInvestmentTransaction, InvestmentManager } = proxyquire(
  '../../../src/server/managers/investmentManager',
  {
    '../resources/repositories/investmentRepo': { default: investmentRepoStub },
    '../engine/taxEngine': { default: calculateTaxStub },
  },
);

describe('InvestmentManager', () => {
  function buildTransaction(overrides: Partial<ITransaction> = {}): ITransaction {
    return {
      id: 10,
      name: 'Compra CDB',
      categoryId: null,
      accountId: 3,
      type: 'investmentBuy',
      date: new Date(2024, 0, 15),
      value: '1000.00',
      userId: 1,
      investmentType: 'cdb',
      createdAt: new Date(),
      updatedAt: null,
      ...overrides,
    } as ITransaction;
  }

  beforeEach(() => {
    investmentRepoStub.save.reset();
    investmentRepoStub.findById.reset();
    investmentRepoStub.update.reset();
    investmentRepoStub.deleteById.reset();
    investmentRepoStub.listAll.reset();
    investmentRepoStub.saveTransactionLink.reset();
    investmentRepoStub.findTransactionLink.reset();
    investmentRepoStub.deleteTransactionLink.reset();
    investmentRepoStub.saveGoalAllocations.reset();
    investmentRepoStub.findGoalAllocations.reset();
    investmentRepoStub.applyTransactionToPosition.reset();
    investmentRepoStub.recalculatePosition.reset();
    investmentRepoStub.archiveInvestment.reset();
    calculateTaxStub.reset();

    investmentRepoStub.saveTransactionLink.resolves();
    investmentRepoStub.applyTransactionToPosition.resolves();
    investmentRepoStub.saveGoalAllocations.resolves();
    investmentRepoStub.archiveInvestment.resolves();
    investmentRepoStub.deleteTransactionLink.resolves();
    investmentRepoStub.recalculatePosition.resolves();
    calculateTaxStub.returns(0);
  });

  describe('applyInvestmentTransaction', () => {
    it('should use existing investment when id is provided', async () => {
      const transaction = buildTransaction();
      const entry: IInvestmentTransactionEntry = { investment: { id: 5 } };

      await applyInvestmentTransaction(transaction, entry, investmentRepoStub);

      investmentRepoStub.save.should.not.have.been.called;
      investmentRepoStub.saveTransactionLink.should.have.been.calledOnceWith(10, 5, undefined, undefined);
    });

    it('should create investment inline when no id is provided', async () => {
      const newInvestment = {
        id: 7, name: 'CDB Nubank', investmentType: 'cdb', totalInvested: '0', archived: false,
      };
      investmentRepoStub.save.resolves(newInvestment);

      const transaction = buildTransaction();
      const entry: IInvestmentTransactionEntry = {
        investment: { name: 'CDB Nubank', investmentType: 'cdb' } as any,
      };

      await applyInvestmentTransaction(transaction, entry, investmentRepoStub);

      investmentRepoStub.save.should.have.been.calledOnce;
      const savedPayload = investmentRepoStub.save.firstCall.args[0];
      savedPayload.should.have.property('totalInvested', '0');
      savedPayload.should.have.property('archived', false);
      investmentRepoStub.saveTransactionLink.should.have.been.calledOnceWith(10, 7, undefined, undefined);
    });

    it('should pass quantity and unitPrice to saveTransactionLink and applyTransactionToPosition', async () => {
      const transaction = buildTransaction();
      const entry: IInvestmentTransactionEntry = {
        investment: { id: 5 },
        quantity: 10,
        unitPrice: 50,
      };

      await applyInvestmentTransaction(transaction, entry, investmentRepoStub);

      investmentRepoStub.saveTransactionLink.should.have.been.calledOnceWith(10, 5, 10, 50);
      investmentRepoStub.applyTransactionToPosition.should.have.been.calledOnceWith(5, transaction, 10, 50);
    });

    it('should save goal allocations when provided', async () => {
      const transaction = buildTransaction();
      const goals = [{ goalId: 1, percentage: 100 }];
      const entry: IInvestmentTransactionEntry = {
        investment: { id: 5 },
        goals,
      };

      await applyInvestmentTransaction(transaction, entry, investmentRepoStub);

      investmentRepoStub.saveGoalAllocations.should.have.been.calledOnceWith(5, goals);
    });

    it('should not save goal allocations when not provided', async () => {
      const transaction = buildTransaction();
      const entry: IInvestmentTransactionEntry = { investment: { id: 5 } };

      await applyInvestmentTransaction(transaction, entry, investmentRepoStub);

      investmentRepoStub.saveGoalAllocations.should.not.have.been.called;
    });

    it('should not save goal allocations when goals list is empty', async () => {
      const transaction = buildTransaction();
      const entry: IInvestmentTransactionEntry = { investment: { id: 5 }, goals: [] };

      await applyInvestmentTransaction(transaction, entry, investmentRepoStub);

      investmentRepoStub.saveGoalAllocations.should.not.have.been.called;
    });

    describe('investmentDueDate', () => {
      const investment = {
        id: 5,
        name: 'CDB Nubank',
        investmentType: 'cdb',
        totalInvested: '1000.00',
        createdAt: new Date(2023, 0, 1),
      };

      beforeEach(() => {
        investmentRepoStub.findById.resolves(investment);
      });

      it('should archive the investment on investmentDueDate', async () => {
        const transaction = buildTransaction({
          type: 'investmentDueDate',
          value: '1100.00',
          date: new Date(2024, 0, 1),
        });
        const entry: IInvestmentTransactionEntry = { investment: { id: 5 } };

        await applyInvestmentTransaction(transaction, entry, investmentRepoStub);

        investmentRepoStub.archiveInvestment.should.have.been.calledOnceWith(5);
      });

      it('should return tax transaction payload when tax is positive', async () => {
        calculateTaxStub.returns(150);
        const transaction = buildTransaction({
          type: 'investmentDueDate',
          value: '1100.00',
          date: new Date(2024, 0, 1),
        });
        const entry: IInvestmentTransactionEntry = { investment: { id: 5 } };

        const result = await applyInvestmentTransaction(transaction, entry, investmentRepoStub);

        (result !== null).should.be.true;
        result!.should.have.property('type', 'investmentTax');
        result!.should.have.property('value', '150');
        result!.should.have.property('name', 'IR - CDB Nubank');
        result!.should.have.property('accountId', 3);
        result!.should.have.property('userId', 1);
      });

      it('should return null when tax is zero', async () => {
        calculateTaxStub.returns(0);
        const transaction = buildTransaction({
          type: 'investmentDueDate',
          value: '1100.00',
          date: new Date(2024, 0, 1),
        });
        const entry: IInvestmentTransactionEntry = { investment: { id: 5 } };

        const result = await applyInvestmentTransaction(transaction, entry, investmentRepoStub);

        (result === null).should.be.true;
      });

      it('should pass gross income and holding days to calculateTax', async () => {
        calculateTaxStub.returns(0);
        const transaction = buildTransaction({
          type: 'investmentDueDate',
          value: '1100.00',
          date: new Date(2024, 0, 1),
        });
        const entry: IInvestmentTransactionEntry = { investment: { id: 5 } };

        await applyInvestmentTransaction(transaction, entry, investmentRepoStub);

        calculateTaxStub.should.have.been.calledOnce;
        const [type, grossIncome] = calculateTaxStub.firstCall.args;
        type.should.equal('cdb');
        grossIncome.should.equal(100);
      });

      it('should not create tax payload when investment is not found', async () => {
        investmentRepoStub.findById.resolves(null);
        const transaction = buildTransaction({ type: 'investmentDueDate', value: '1100.00' });
        const entry: IInvestmentTransactionEntry = { investment: { id: 5 } };

        const result = await applyInvestmentTransaction(transaction, entry, investmentRepoStub);

        (result === null).should.be.true;
        investmentRepoStub.archiveInvestment.should.not.have.been.called;
      });
    });

    it('should return null for non-dueDate transaction types', async () => {
      const transaction = buildTransaction({ type: 'investmentBuy' });
      const entry: IInvestmentTransactionEntry = { investment: { id: 5 } };

      const result = await applyInvestmentTransaction(transaction, entry, investmentRepoStub);

      (result === null).should.be.true;
    });
  });

  describe('revertInvestmentTransaction', () => {
    it('should return early when no link exists for the transaction', async () => {
      investmentRepoStub.findTransactionLink.resolves(null);
      const transaction = buildTransaction();

      await revertInvestmentTransaction(transaction, investmentRepoStub);

      investmentRepoStub.deleteTransactionLink.should.not.have.been.called;
      investmentRepoStub.recalculatePosition.should.not.have.been.called;
    });

    it('should delete the link and recalculate position when link exists', async () => {
      investmentRepoStub.findTransactionLink.resolves({
        transactionId: 10, investmentId: 5, quantity: '10', unitPrice: '50',
      });
      const transaction = buildTransaction();

      await revertInvestmentTransaction(transaction, investmentRepoStub);

      investmentRepoStub.deleteTransactionLink.should.have.been.calledOnceWith(10);
      investmentRepoStub.recalculatePosition.should.have.been.calledOnceWith(5);
    });
  });

  describe('InvestmentManager factory', () => {
    const manager = InvestmentManager(investmentRepoStub);

    it('createInvestment should delegate to repo.save', async () => {
      const payload = { name: 'CDB', investmentType: 'cdb' };
      investmentRepoStub.save.resolves({ id: 1, ...payload });

      await manager.createInvestment(payload as any);

      investmentRepoStub.save.should.have.been.calledOnceWith(payload);
    });

    it('getInvestment should delegate to repo.findById', async () => {
      investmentRepoStub.findById.resolves({ id: 5 });

      await manager.getInvestment(5);

      investmentRepoStub.findById.should.have.been.calledOnceWith(5);
    });

    it('updateInvestment should delegate to repo.update', async () => {
      investmentRepoStub.update.resolves({ id: 5, name: 'Updated' });

      await manager.updateInvestment(5, { name: 'Updated' } as any);

      investmentRepoStub.update.should.have.been.calledOnceWith(5, { name: 'Updated' });
    });

    it('deleteInvestment should delegate to repo.deleteById', async () => {
      investmentRepoStub.deleteById.resolves({ id: 5 });

      await manager.deleteInvestment(5);

      investmentRepoStub.deleteById.should.have.been.calledOnceWith(5);
    });

    it('listInvestments should delegate to repo.listAll', async () => {
      investmentRepoStub.listAll.resolves([{ id: 5 }]);

      await manager.listInvestments();

      investmentRepoStub.listAll.should.have.been.calledOnce;
    });
  });
});
