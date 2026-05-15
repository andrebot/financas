import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import sinonChai from 'sinon-chai';
import transactionRepo from '../../../../src/server/resources/repositories/transactionRepo';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';
import { transactions, transactionToGoals } from '../../../../src/server/resources/models/transactionModel';
import type { ITransactionGoalEntry } from '../../../../src/server/types';
import { requestContext } from '../../../../src/server/utils/authorization';

const runWithContext = (fn: () => Promise<unknown>) =>
  requestContext.run({ userId: 1, isAdmin: true }, fn);

chai.use(sinonChai);

type DrizzleDbStub = {
  select: SinonStub;
  update: SinonStub;
  delete: SinonStub;
  insert: SinonStub;
};

describe('TransactionRepo', () => {
  const dbHolder = databaseConnection as unknown as { db: DrizzleDbStub };

  let originalDb: unknown;
  let selectStub: SinonStub;
  let selectFromStub: SinonStub;
  let selectInnerJoinStub: SinonStub;
  let selectWhereStub: SinonStub;
  let updateStub: SinonStub;
  let updateSetStub: SinonStub;
  let updateWhereStub: SinonStub;
  let deleteStub: SinonStub;
  let deleteWhereStub: SinonStub;
  let insertStub: SinonStub;
  let insertValuesStub: SinonStub;

  before(() => {
    originalDb = dbHolder.db;
  });

  beforeEach(() => {
    selectWhereStub = sinon.stub().resolves([]);
    selectInnerJoinStub = sinon.stub();
    selectInnerJoinStub.returns({ innerJoin: selectInnerJoinStub, where: selectWhereStub });
    selectFromStub = sinon.stub().returns({ where: selectWhereStub, innerJoin: selectInnerJoinStub });
    selectStub = sinon.stub().returns({ from: selectFromStub });

    updateWhereStub = sinon.stub().resolves({ rowCount: 0 });
    updateSetStub = sinon.stub().returns({ where: updateWhereStub });
    updateStub = sinon.stub().returns({ set: updateSetStub });

    deleteWhereStub = sinon.stub().resolves({ rowCount: 0 });
    deleteStub = sinon.stub().returns({ where: deleteWhereStub });

    insertValuesStub = sinon.stub().resolves();
    insertStub = sinon.stub().returns({ values: insertValuesStub });

    dbHolder.db = {
      select: selectStub,
      update: updateStub,
      delete: deleteStub,
      insert: insertStub,
    };
  });

  afterEach(() => {
    dbHolder.db = originalDb as DrizzleDbStub;
  });

  describe('findByCategoryWithDateRange', () => {
    it('should query transactions by user, categories, and date bounds', async () => {
      const userId = 1;
      const categories = [10, 20];
      const startDate = new Date('2021-01-01');
      const endDate = new Date('2021-01-31');

      selectWhereStub.resolves([{ id: 99, userId }]);

      const rows = await runWithContext(() => transactionRepo.findByCategoryWithDateRange(
        userId,
        categories,
        startDate,
        endDate,
      )) as Awaited<ReturnType<typeof transactionRepo.findByCategoryWithDateRange>>;

      selectStub.should.have.been.calledOnce;
      selectFromStub.should.have.been.calledOnceWithExactly(transactions);
      selectWhereStub.should.have.been.calledOnce;
      chai.assert.exists(selectWhereStub.firstCall.args[0]);

      rows.should.be.an('array');
      rows.should.have.lengthOf(1);
      (rows[0] as { id: number }).should.have.property('id', 99);
    });

    it('should return empty array when no transactions match', async () => {
      selectWhereStub.resolves([]);

      const rows = await runWithContext(() => transactionRepo.findByCategoryWithDateRange(
        100,
        [1],
        new Date('2021-01-01'),
        new Date('2021-01-31'),
      )) as Awaited<ReturnType<typeof transactionRepo.findByCategoryWithDateRange>>;

      rows.should.be.an('array').that.is.empty;
    });
  });

  describe('removeCategoriesFromTransactions', () => {
    it('should clear categoryId where category is in the list', async () => {
      const categoryIds = [1, 2];
      updateWhereStub.resolves({ rowCount: 2 });

      const result = await runWithContext(() => transactionRepo.removeCategoriesFromTransactions(categoryIds)) as number;

      updateStub.should.have.been.calledOnceWithExactly(transactions);
      updateSetStub.should.have.been.calledOnceWithExactly({ categoryId: null });
      updateWhereStub.should.have.been.calledOnce;
      chai.assert.exists(updateWhereStub.firstCall.args[0]);
      result.should.equal(2);
    });

    it('should return 0 when no rowCount is reported', async () => {
      updateWhereStub.resolves({ rowCount: 0 });

      const result = await runWithContext(() => transactionRepo.removeCategoriesFromTransactions([999])) as number;

      result.should.equal(0);
    });
  });

  describe('deleteGoalFromTransactions', () => {
    it('should select from transactionToGoals with inner joins and return row count', async () => {
      const goalId = 55;
      selectWhereStub.resolves([{ goalId: 55 }, { goalId: 55 }]);

      const result = await runWithContext(() => transactionRepo.deleteGoalFromTransactions(goalId)) as number;

      selectStub.should.have.been.calledOnce;
      selectFromStub.should.have.been.calledOnceWithExactly(transactionToGoals);
      selectInnerJoinStub.should.have.been.called;
      selectWhereStub.should.have.been.calledOnce;
      result.should.equal(2);
    });

    it('should return 0 when no rows are found', async () => {
      selectWhereStub.resolves([]);

      const result = await runWithContext(() => transactionRepo.deleteGoalFromTransactions(777)) as number;

      result.should.equal(0);
    });
  });

  describe('findByMonthAndYear', () => {
    it('should query transactions for the given month and year', async () => {
      const expected = [{ id: 1 }, { id: 2 }];
      selectWhereStub.resolves(expected);

      const rows = await transactionRepo.findByMonthAndYear(2024, 3);

      selectStub.should.have.been.calledOnce;
      selectFromStub.should.have.been.calledOnceWithExactly(transactions);
      selectWhereStub.should.have.been.calledOnce;
      chai.assert.exists(selectWhereStub.firstCall.args[0]);
      rows.should.deep.equal(expected);
    });

    it('should return empty array when no transactions are found', async () => {
      selectWhereStub.resolves([]);

      const rows = await transactionRepo.findByMonthAndYear(2024, 1);

      rows.should.be.an('array').that.is.empty;
    });
  });

  describe('deleteTransactionFromGoals', () => {
    it('should delete goal junction rows for the given transaction', async () => {
      const transactionId = 42;
      deleteWhereStub.resolves({ rowCount: 3 });

      const result = await transactionRepo.deleteTransactionFromGoals(transactionId);

      deleteStub.should.have.been.calledOnceWithExactly(transactionToGoals);
      deleteWhereStub.should.have.been.calledOnce;
      chai.assert.exists(deleteWhereStub.firstCall.args[0]);
      result.should.equal(3);
    });

    it('should return 0 when rowCount is null', async () => {
      deleteWhereStub.resolves({ rowCount: null });

      const result = await transactionRepo.deleteTransactionFromGoals(99);

      result.should.equal(0);
    });
  });

  describe('saveTransactionGoals', () => {
    it('should insert goal entries for the given transaction', async () => {
      const transactionId = 10;
      const goals: ITransactionGoalEntry[] = [
        { goalId: 1, percentage: 0.5 },
        { goalId: 2, percentage: 0.5 },
      ];

      await transactionRepo.saveTransactionGoals(transactionId, goals);

      insertStub.should.have.been.calledOnceWithExactly(transactionToGoals);
      insertValuesStub.should.have.been.calledOnce;
      const insertedRows = insertValuesStub.firstCall.args[0];
      insertedRows.should.have.lengthOf(2);
      insertedRows[0].should.deep.include({ transactionId: 10, goalId: 1 });
      insertedRows[1].should.deep.include({ transactionId: 10, goalId: 2 });
    });

    it('should not insert when goals list is empty', async () => {
      await transactionRepo.saveTransactionGoals(10, []);

      insertStub.should.not.have.been.called;
    });
  });
});
