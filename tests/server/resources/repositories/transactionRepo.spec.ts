import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import transactionRepo from '../../../../src/server/resources/repositories/transactionRepo';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';
import { transactions, transactionToGoals } from '../../../../src/server/resources/models/transactionModel';

type DrizzleDbStub = {
  select: SinonStub;
  update: SinonStub;
  delete: SinonStub;
};

describe('TransactionRepo', () => {
  const dbHolder = databaseConnection as unknown as { db: DrizzleDbStub };

  let originalDb: unknown;
  let selectStub: SinonStub;
  let selectFromStub: SinonStub;
  let selectWhereStub: SinonStub;
  let updateStub: SinonStub;
  let updateSetStub: SinonStub;
  let updateWhereStub: SinonStub;
  let deleteStub: SinonStub;
  let deleteWhereStub: SinonStub;

  before(() => {
    originalDb = dbHolder.db;
  });

  beforeEach(() => {
    selectWhereStub = sinon.stub().resolves([]);
    selectFromStub = sinon.stub().returns({ where: selectWhereStub });
    selectStub = sinon.stub().returns({ from: selectFromStub });

    updateWhereStub = sinon.stub().resolves({ rowCount: 0 });
    updateSetStub = sinon.stub().returns({ where: updateWhereStub });
    updateStub = sinon.stub().returns({ set: updateSetStub });

    deleteWhereStub = sinon.stub().resolves({ rowCount: 0 });
    deleteStub = sinon.stub().returns({ where: deleteWhereStub });

    dbHolder.db = {
      select: selectStub,
      update: updateStub,
      delete: deleteStub,
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

      const rows = await transactionRepo.findByCategoryWithDateRange(
        userId,
        categories,
        startDate,
        endDate,
      );

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

      const rows = await transactionRepo.findByCategoryWithDateRange(
        100,
        [1],
        new Date('2021-01-01'),
        new Date('2021-01-31'),
      );

      rows.should.be.an('array').that.is.empty;
    });
  });

  describe('removeCategoriesFromTransactions', () => {
    it('should clear categoryId where category is in the list', async () => {
      const categoryIds = [1, 2];
      updateWhereStub.resolves({ rowCount: 2 });

      const result = await transactionRepo.removeCategoriesFromTransactions(categoryIds);

      updateStub.should.have.been.calledOnceWithExactly(transactions);
      updateSetStub.should.have.been.calledOnceWithExactly({ categoryId: null });
      updateWhereStub.should.have.been.calledOnce;
      chai.assert.exists(updateWhereStub.firstCall.args[0]);
      result.should.equal(2);
    });

    it('should return 0 when no rowCount is reported', async () => {
      updateWhereStub.resolves({ rowCount: 0 });

      const result = await transactionRepo.removeCategoriesFromTransactions([999]);

      result.should.equal(0);
    });
  });

  describe('deleteGoalFromTransactions', () => {
    it('should delete rows from transactionToGoals', async () => {
      const goalId = 55;
      deleteWhereStub.resolves({ rowCount: 3 });

      const result = await transactionRepo.deleteGoalFromTransactions(goalId);

      deleteStub.should.have.been.calledOnceWithExactly(transactionToGoals);
      deleteWhereStub.should.have.been.calledOnce;
      chai.assert.exists(deleteWhereStub.firstCall.args[0]);
      result.should.equal(3);
    });

    it('should return 0 when no rows are deleted', async () => {
      deleteWhereStub.resolves({ rowCount: null });

      const result = await transactionRepo.deleteGoalFromTransactions(777);

      result.should.equal(0);
    });
  });
});
