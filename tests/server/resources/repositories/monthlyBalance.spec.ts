import { should } from 'chai';
import sinon, { SinonStub } from 'sinon';
import monthlyBalanceRepo from '../../../../src/server/resources/repositories/monthlyBalanceRepo';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';
import { monthlyBalances } from '../../../../src/server/resources/models/monthlyBalanceModel';
import type { ITransaction } from '../../../../src/server/types';
import { requestContext } from '../../../../src/server/utils/authorization';

const runWithContext = (fn: () => Promise<unknown>) =>
  requestContext.run({ userId: 1, isAdmin: true }, fn);

describe('MonthlyBalanceRepo', function () {
  const dbHolder = databaseConnection as unknown as { db: { select: SinonStub; update: SinonStub } };

  let originalDb: unknown;
  let selectStub: SinonStub;
  let selectFromStub: SinonStub;
  let selectWhereStub: SinonStub;
  let updateStub: SinonStub;
  let updateSetStub: SinonStub;
  let updateWhereStub: SinonStub;

  before(function () {
    originalDb = dbHolder.db;
  });

  beforeEach(function () {
    selectWhereStub = sinon.stub().resolves([]);
    selectFromStub = sinon.stub().returns({ where: selectWhereStub });
    selectStub = sinon.stub().returns({ from: selectFromStub });

    updateWhereStub = sinon.stub().resolves();
    updateSetStub = sinon.stub().returns({ where: updateWhereStub });
    updateStub = sinon.stub().returns({ set: updateSetStub });

    dbHolder.db = { select: selectStub, update: updateStub };
  });

  afterEach(function () {
    dbHolder.db = originalDb as { select: SinonStub; update: SinonStub };
  });

  function buildTransaction(overrides: Partial<ITransaction> = {}): ITransaction {
    return {
      id: 1,
      name: 'Test Transaction',
      categoryId: null,
      accountId: 3,
      type: 'transferIn',
      date: new Date(2021, 0, 15),
      value: '0.00',
      userId: 1,
      createdAt: new Date(),
      updatedAt: null,
      investmentType: null,
      ...overrides,
    } as ITransaction;
  }

  it('should return the row when a monthly balance is found', async function () {
    const lookupDate = new Date(Date.UTC(2021, 5, 1, 15, 0, 0));
    const txn = buildTransaction({ accountId: 5 });
    const row = {
      id: 42,
      accountId: 5,
      date: '2021-06-01',
      openingBalance: '100.00',
      closingBalance: '100.00',
      totalIn: '0',
      totalOut: '0',
      transactionsJson: [],
      createdAt: new Date(),
      updatedAt: null,
    };
    selectWhereStub.resolves([row]);

    const result = await runWithContext(() => monthlyBalanceRepo.findMonthlyBalance(txn, lookupDate)) as typeof row;

    selectStub.should.have.been.calledOnce;
    selectFromStub.should.have.been.calledOnceWithExactly(monthlyBalances);
    selectWhereStub.should.have.been.calledOnce;
    should().exist(selectWhereStub.firstCall.args[0]);
    result.should.deep.equal(row);
  });

  it('should return null when no monthly balance matches', async function () {
    selectWhereStub.resolves([]);
    const result = await runWithContext(() => monthlyBalanceRepo.findMonthlyBalance(
      buildTransaction(),
      new Date(2024, 0, 1),
    ));

    selectStub.should.have.been.calledOnce;
    should().not.exist(result);
  });

  describe('findByYearAndMonth', function () {
    it('should return all matching monthly balance records for a given year and month', async function () {
      const row = {
        id: 10,
        accountId: 3,
        month: 6,
        year: 2026,
        openingBalance: '0.00',
        closingBalance: '500.00',
        createdAt: new Date(),
        updatedAt: null,
      };
      selectWhereStub.resolves([row]);

      const result = await runWithContext(() => monthlyBalanceRepo.findByYearAndMonth(2026, 6)) as typeof row[];

      selectStub.should.have.been.calledOnce;
      selectFromStub.should.have.been.calledOnceWithExactly(monthlyBalances);
      selectWhereStub.should.have.been.calledOnce;
      result.should.deep.equal([row]);
    });

    it('should return an empty array when no records match', async function () {
      selectWhereStub.resolves([]);

      const result = await runWithContext(() => monthlyBalanceRepo.findByYearAndMonth(2020, 1));

      (result as unknown[]).should.deep.equal([]);
    });
  });

  describe('updateMonthlyBalanceWithTransaction', function () {
    it('should call update with correct chain when adding a transaction', async function () {
      const txn = buildTransaction({ accountId: 5, value: '50.00' });

      await runWithContext(() => monthlyBalanceRepo.updateMonthlyBalanceWithTransaction(txn, false));

      updateStub.should.have.been.calledOnceWithExactly(monthlyBalances);
      updateSetStub.should.have.been.calledOnce;
      const setArgs = updateSetStub.firstCall.args[0];
      setArgs.should.have.keys('closingBalance', 'totalIn', 'totalOut');
      updateWhereStub.should.have.been.calledOnce;
      should().exist(updateWhereStub.firstCall.args[0]);
    });

    it('should default shouldInvertValue to false when not provided', async function () {
      const txn = buildTransaction({ accountId: 5, value: '50.00' });

      await runWithContext(() => monthlyBalanceRepo.updateMonthlyBalanceWithTransaction(txn));

      updateStub.should.have.been.calledOnceWithExactly(monthlyBalances);
      updateSetStub.should.have.been.calledOnce;
      updateWhereStub.should.have.been.calledOnce;
    });

    it('should call update when inverting (reverting) a transaction', async function () {
      const txn = buildTransaction({ accountId: 5, value: '50.00' });

      await runWithContext(() => monthlyBalanceRepo.updateMonthlyBalanceWithTransaction(txn, true));

      updateStub.should.have.been.calledOnceWithExactly(monthlyBalances);
      updateSetStub.should.have.been.calledOnce;
      updateWhereStub.should.have.been.calledOnce;
    });

    it('should correctly compute outflow deltas when type is an outflow', async function () {
      const txn = buildTransaction({ accountId: 5, type: 'cardPurchase', value: '75.00' });

      await runWithContext(() => monthlyBalanceRepo.updateMonthlyBalanceWithTransaction(txn, false));

      updateStub.should.have.been.calledOnceWithExactly(monthlyBalances);
      updateSetStub.should.have.been.calledOnce;
      const setArgs = updateSetStub.firstCall.args[0];
      setArgs.should.have.keys('closingBalance', 'totalIn', 'totalOut');
      updateWhereStub.should.have.been.calledOnce;
    });
  });
});
