import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import sinonChai from 'sinon-chai';
import investmentRepo from '../../../../src/server/resources/repositories/investmentRepo';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';
import type { ITransaction } from '../../../../src/server/types';
import { requestContext } from '../../../../src/server/utils/authorization';

const runWithContext = (fn: () => Promise<unknown>) =>
  requestContext.run({ userId: 1, isAdmin: true }, fn);

chai.use(sinonChai);
chai.should();

type DbHolder = {
  db: {
    select: SinonStub;
    insert: SinonStub;
    update: SinonStub;
    delete: SinonStub;
  };
};

describe('Investment Repository', () => {
  const dbHolder = databaseConnection as unknown as DbHolder;

  let originalDb: unknown;
  let selectStub: SinonStub;
  let selectFromStub: SinonStub;
  let selectWhereStub: SinonStub;
  let selectLimitStub: SinonStub;
  let selectOrderByStub: SinonStub;
  let selectInnerJoinStub: SinonStub;
  let insertStub: SinonStub;
  let insertValuesStub: SinonStub;
  let updateStub: SinonStub;
  let updateSetStub: SinonStub;
  let updateWhereStub: SinonStub;
  let deleteStub: SinonStub;
  let deleteWhereStub: SinonStub;

  before(() => {
    originalDb = dbHolder.db;
  });

  beforeEach(() => {
    selectLimitStub = sinon.stub().resolves([]);
    selectOrderByStub = sinon.stub().resolves([]);
    selectWhereStub = sinon.stub().returns({ limit: selectLimitStub, orderBy: selectOrderByStub });
    selectInnerJoinStub = sinon.stub().returns({ where: selectWhereStub });
    selectFromStub = sinon.stub().returns({ where: selectWhereStub, innerJoin: selectInnerJoinStub });
    selectStub = sinon.stub().returns({ from: selectFromStub });

    insertValuesStub = sinon.stub().resolves();
    insertStub = sinon.stub().returns({ values: insertValuesStub });

    updateWhereStub = sinon.stub().resolves();
    updateSetStub = sinon.stub().returns({ where: updateWhereStub });
    updateStub = sinon.stub().returns({ set: updateSetStub });

    deleteWhereStub = sinon.stub().resolves();
    deleteStub = sinon.stub().returns({ where: deleteWhereStub });

    dbHolder.db = {
      select: selectStub,
      insert: insertStub,
      update: updateStub,
      delete: deleteStub,
    };
  });

  afterEach(() => {
    dbHolder.db = originalDb as DbHolder['db'];
  });

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

  describe('saveTransactionLink', () => {
    it('should insert a row into transactionToInvestments without quantity for fixed income', async () => {
      await runWithContext(() => investmentRepo.saveTransactionLink(10, 5));

      insertStub.should.have.been.calledOnce;
      const values = insertValuesStub.firstCall.args[0];
      values.should.have.property('transactionId', 10);
      values.should.have.property('investmentId', 5);
      values.should.have.property('quantity', null);
      values.should.have.property('unitPrice', null);
    });

    it('should insert a row with quantity and unitPrice for variable income', async () => {
      await runWithContext(() => investmentRepo.saveTransactionLink(10, 5, 100, 50.5));

      const values = insertValuesStub.firstCall.args[0];
      values.should.have.property('quantity', '100');
      values.should.have.property('unitPrice', '50.5');
    });
  });

  describe('findTransactionLink', () => {
    it('should return null when no link exists', async () => {
      selectLimitStub.resolves([]);

      const result = await runWithContext(() => investmentRepo.findTransactionLink(10));

      (result as null | object === null).should.be.true;
    });

    it('should return the link row when found', async () => {
      const mockLink = {
        transactionId: 10, investmentId: 5, quantity: '100', unitPrice: '50',
      };
      selectLimitStub.resolves([mockLink]);

      const result = await runWithContext(() => investmentRepo.findTransactionLink(10));

      (result as typeof mockLink).should.deep.equal(mockLink);
    });
  });

  describe('deleteTransactionLink', () => {
    it('should delete the row for the given transactionId', async () => {
      await runWithContext(() => investmentRepo.deleteTransactionLink(10));

      deleteStub.should.have.been.calledOnce;
      deleteWhereStub.should.have.been.calledOnce;
    });
  });

  describe('saveGoalAllocations', () => {
    it('should delete existing allocations and insert new ones', async () => {
      const goals = [
        { goalId: 1, percentage: 60 },
        { goalId: 2, percentage: 40 },
      ];

      await runWithContext(() => investmentRepo.saveGoalAllocations(5, goals));

      deleteStub.should.have.been.calledOnce;
      insertStub.should.have.been.calledOnce;
      const inserted = insertValuesStub.firstCall.args[0];
      inserted.should.be.an('array').with.lengthOf(2);
      inserted[0].should.have.property('investmentId', 5);
      inserted[0].should.have.property('goalId', 1);
      inserted[0].should.have.property('percentage', '60');
    });

    it('should only delete when goals list is empty', async () => {
      await runWithContext(() => investmentRepo.saveGoalAllocations(5, []));

      deleteStub.should.have.been.calledOnce;
      insertStub.should.not.have.been.called;
    });
  });

  describe('findGoalAllocations', () => {
    it('should return goal allocations as numbers', async () => {
      selectWhereStub.resolves([
        { investmentId: 5, goalId: 1, percentage: '60.00' },
        { investmentId: 5, goalId: 2, percentage: '40.00' },
      ]);

      const result = await runWithContext(() => investmentRepo.findGoalAllocations(5)) as object[];

      result.should.deep.equal([
        { goalId: 1, percentage: 60 },
        { goalId: 2, percentage: 40 },
      ]);
    });

    it('should return empty array when no allocations', async () => {
      selectWhereStub.resolves([]);

      const result = await runWithContext(() => investmentRepo.findGoalAllocations(5)) as object[];

      result.should.deep.equal([]);
    });
  });

  describe('applyTransactionToPosition', () => {
    describe('investmentBuy (fixed income)', () => {
      it('should increment totalInvested via SQL expression', async () => {
        const tx = buildTransaction({ type: 'investmentBuy', value: '1000.00' });

        await runWithContext(() => investmentRepo.applyTransactionToPosition(5, tx));

        updateStub.should.have.been.calledOnce;
        updateSetStub.should.have.been.calledOnce;
        const setArgs = updateSetStub.firstCall.args[0];
        setArgs.should.have.property('totalInvested');
      });
    });

    describe('investmentBuy (variable income)', () => {
      it('should update quantity, averagePrice, and totalInvested', async () => {
        selectLimitStub.resolves([{
          quantity: '10', averagePrice: '50.00', totalInvested: '500.00',
        }]);

        const tx = buildTransaction({ type: 'investmentBuy', value: '300.00' });

        await runWithContext(() => investmentRepo.applyTransactionToPosition(5, tx, 5, 60));

        updateSetStub.should.have.been.calledOnce;
        const setArgs = updateSetStub.firstCall.args[0];
        setArgs.should.have.property('quantity');
        setArgs.should.have.property('averagePrice');
        setArgs.should.have.property('totalInvested');
        Number(setArgs.quantity).should.equal(15);
        Number(setArgs.totalInvested).should.equal(800);
      });

      it('should use unitPrice as averagePrice on first buy (no existing quantity)', async () => {
        selectLimitStub.resolves([{
          quantity: '0', averagePrice: '0', totalInvested: '0',
        }]);

        const tx = buildTransaction({ type: 'investmentBuy', value: '500.00' });

        await runWithContext(() => investmentRepo.applyTransactionToPosition(5, tx, 10, 50));

        const setArgs = updateSetStub.firstCall.args[0];
        Number(setArgs.averagePrice).should.equal(50);
        Number(setArgs.quantity).should.equal(10);
      });

      it('should return early when investment is not found', async () => {
        selectLimitStub.resolves([]);

        const tx = buildTransaction({ type: 'investmentBuy', value: '500.00' });

        await runWithContext(() => investmentRepo.applyTransactionToPosition(5, tx, 10, 50));

        updateStub.should.not.have.been.called;
      });
    });

    describe('investmentSell', () => {
      it('should reduce quantity and totalInvested based on cost basis', async () => {
        selectLimitStub.resolves([{
          quantity: '10', averagePrice: '50.00', totalInvested: '500.00',
        }]);

        const tx = buildTransaction({ type: 'investmentSell', value: '250.00' });

        await runWithContext(() => investmentRepo.applyTransactionToPosition(5, tx, 5, 55));

        const setArgs = updateSetStub.firstCall.args[0];
        Number(setArgs.quantity).should.equal(5);
        Number(setArgs.totalInvested).should.equal(250);
        setArgs.should.have.property('archived', false);
      });

      it('should archive when quantity reaches zero', async () => {
        selectLimitStub.resolves([{
          quantity: '5', averagePrice: '50.00', totalInvested: '250.00',
        }]);

        const tx = buildTransaction({ type: 'investmentSell', value: '250.00' });

        await runWithContext(() => investmentRepo.applyTransactionToPosition(5, tx, 5, 55));

        const setArgs = updateSetStub.firstCall.args[0];
        setArgs.should.have.property('archived', true);
      });

      it('should return early when quantity is not provided', async () => {
        const tx = buildTransaction({ type: 'investmentSell', value: '100.00' });

        await runWithContext(() => investmentRepo.applyTransactionToPosition(5, tx));

        updateStub.should.not.have.been.called;
      });

      it('should return early when investment is not found', async () => {
        selectLimitStub.resolves([]);

        const tx = buildTransaction({ type: 'investmentSell', value: '100.00' });

        await runWithContext(() => investmentRepo.applyTransactionToPosition(5, tx, 5, 50));

        updateStub.should.not.have.been.called;
      });
    });

    describe('income types (no-op)', () => {
      it('should not update position for investmentDividend', async () => {
        const tx = buildTransaction({ type: 'investmentDividend', value: '100.00' });

        await runWithContext(() => investmentRepo.applyTransactionToPosition(5, tx));

        updateStub.should.not.have.been.called;
      });

      it('should not update position for investmentInterest', async () => {
        const tx = buildTransaction({ type: 'investmentInterest', value: '50.00' });

        await runWithContext(() => investmentRepo.applyTransactionToPosition(5, tx));

        updateStub.should.not.have.been.called;
      });

      it('should not update position for investmentDueDate', async () => {
        const tx = buildTransaction({ type: 'investmentDueDate', value: '1100.00' });

        await runWithContext(() => investmentRepo.applyTransactionToPosition(5, tx));

        updateStub.should.not.have.been.called;
      });
    });
  });

  describe('recalculatePosition', () => {
    it('should update investment with recomputed values from linked transactions', async () => {
      selectOrderByStub.resolves([
        {
          quantity: '10', unitPrice: '50', txType: 'investmentBuy', txValue: '500',
        },
        {
          quantity: null, unitPrice: null, txType: 'investmentBuy', txValue: '200',
        },
      ]);

      await runWithContext(() => investmentRepo.recalculatePosition(5));

      updateSetStub.should.have.been.calledOnce;
      const setArgs = updateSetStub.firstCall.args[0];
      setArgs.should.have.property('archived', false);
    });

    it('should archive when investmentDueDate is in linked transactions', async () => {
      selectOrderByStub.resolves([
        {
          quantity: null, unitPrice: null, txType: 'investmentBuy', txValue: '1000',
        },
        {
          quantity: null, unitPrice: null, txType: 'investmentDueDate', txValue: '1100',
        },
      ]);

      await runWithContext(() => investmentRepo.recalculatePosition(5));

      const setArgs = updateSetStub.firstCall.args[0];
      setArgs.should.have.property('archived', true);
    });

    it('should archive variable income when all shares are sold', async () => {
      selectOrderByStub.resolves([
        {
          quantity: '10', unitPrice: '50', txType: 'investmentBuy', txValue: '500',
        },
        {
          quantity: '10', unitPrice: null, txType: 'investmentSell', txValue: '600',
        },
      ]);

      await runWithContext(() => investmentRepo.recalculatePosition(5));

      const setArgs = updateSetStub.firstCall.args[0];
      setArgs.should.have.property('archived', true);
    });

    it('should set quantity to null when variable income is fully sold', async () => {
      selectOrderByStub.resolves([
        {
          quantity: '5', unitPrice: '50', txType: 'investmentBuy', txValue: '250',
        },
        {
          quantity: '5', unitPrice: null, txType: 'investmentSell', txValue: '300',
        },
      ]);

      await runWithContext(() => investmentRepo.recalculatePosition(5));

      const setArgs = updateSetStub.firstCall.args[0];
      (setArgs.quantity === null).should.be.true;
    });
  });

  describe('archiveInvestment', () => {
    it('should set archived to true for the given investment', async () => {
      await runWithContext(() => investmentRepo.archiveInvestment(5));

      updateSetStub.should.have.been.calledOnce;
      const setArgs = updateSetStub.firstCall.args[0];
      setArgs.should.have.property('archived', true);
    });
  });
});
