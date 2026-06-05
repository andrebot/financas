import sinon, { SinonStub } from 'sinon';
import sinonChai from 'sinon-chai';
import chai from 'chai';
import budgetRepo from '../../../../src/server/resources/repositories/budgetRepo';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';
import { budgetToCategories, budgetUsage } from '../../../../src/server/resources/models/budgetModel';
import { requestContext } from '../../../../src/server/utils/authorization';
import type { ITransaction } from '../../../../src/server/types';

chai.use(sinonChai);

type DrizzleDbStub = {
  insert: SinonStub;
  select: SinonStub;
  delete: SinonStub;
  query?: {
    budgets: {
      findMany: SinonStub;
    };
  };
};

describe('Budget Repository', () => {
  const dbHolder = databaseConnection as unknown as { db: DrizzleDbStub };

  let originalDb: unknown;
  let insertStub: SinonStub;
  let insertSelectStub: SinonStub;
  let insertValuesStub: SinonStub;
  let onConflictDoNothingStub: SinonStub;
  let selectStub: SinonStub;
  let selectFromStub: SinonStub;
  let innerJoinStub: SinonStub;
  let selectWhereStub: SinonStub;
  let deleteStub: SinonStub;
  let deleteWhereStub: SinonStub;
  let findManyStub: SinonStub;

  before(() => {
    originalDb = dbHolder.db;
  });

  beforeEach(() => {
    onConflictDoNothingStub = sinon.stub().resolves();
    insertSelectStub = sinon.stub().returns({ onConflictDoNothing: onConflictDoNothingStub });
    insertValuesStub = sinon.stub().returns({ onConflictDoNothing: onConflictDoNothingStub });
    insertStub = sinon.stub().returns({
      select: insertSelectStub,
      values: insertValuesStub,
    });

    selectWhereStub = sinon.stub().returns({ kind: 'select-query' });
    innerJoinStub = sinon.stub().returns({ where: selectWhereStub });
    selectFromStub = sinon.stub().returns({ innerJoin: innerJoinStub });
    selectStub = sinon.stub().returns({ from: selectFromStub });

    deleteWhereStub = sinon.stub().resolves();
    deleteStub = sinon.stub().returns({ where: deleteWhereStub });
    findManyStub = sinon.stub();

    dbHolder.db = {
      insert: insertStub,
      select: selectStub,
      delete: deleteStub,
      query: {
        budgets: {
          findMany: findManyStub,
        },
      },
    };
  });

  afterEach(() => {
    dbHolder.db = originalDb as DrizzleDbStub;
  });

  function buildTxn(overrides: Partial<ITransaction>): ITransaction {
    return {
      id: 1,
      name: 'test',
      categoryId: 10,
      accountId: 1,
      type: 'transferIn',
      date: new Date('2026-01-15'),
      value: '100.00',
      userId: 1,
      createdAt: new Date(),
      updatedAt: null,
      investmentType: null,
      ...overrides,
    } as ITransaction;
  }

  describe('updateBudgetsByNewTransaction', () => {
    it('should skip update when the transaction has no category', async () => {
      const mockTransaction = buildTxn({ categoryId: null });

      await requestContext.run({ userId: 1, isAdmin: false }, async () => {
        await budgetRepo.updateBudgetsByNewTransaction(mockTransaction);
      });

      sinon.assert.notCalled(insertStub);
      sinon.assert.notCalled(selectStub);
    });

    it('should execute insert-select with onConflictDoNothing for a categorised transaction', async () => {
      const mockTransaction = buildTxn({
        categoryId: 42,
        date: new Date('2026-03-01'),
        value: '50.50',
      });

      await requestContext.run({ userId: 1, isAdmin: false }, async () => {
        await budgetRepo.updateBudgetsByNewTransaction(mockTransaction);
      });

      sinon.assert.calledOnceWithExactly(insertStub, budgetUsage);
      sinon.assert.calledOnce(selectStub);
      sinon.assert.calledOnce(selectFromStub);
      sinon.assert.calledOnce(innerJoinStub);
      sinon.assert.calledOnce(selectWhereStub);
      sinon.assert.calledOnceWithExactly(insertSelectStub, { kind: 'select-query' });
      sinon.assert.calledOnce(onConflictDoNothingStub);
    });
  });

  describe('revertBudgetsByTransaction', () => {
    it('should delete the budgetUsage row for the given transaction', async () => {
      const mockTransaction = buildTxn({ id: 7 });

      await budgetRepo.revertBudgetsByTransaction(mockTransaction);

      deleteStub.should.have.been.calledOnceWithExactly(budgetUsage);
      deleteWhereStub.should.have.been.calledOnce;
      chai.assert.exists(deleteWhereStub.firstCall.args[0]);
    });
  });

  describe('saveBudgetCategories', () => {
    it('should skip inserts when no category ids are submitted', async () => {
      await budgetRepo.saveBudgetCategories(5, []);

      insertStub.should.not.have.been.called;
      insertValuesStub.should.not.have.been.called;
      onConflictDoNothingStub.should.not.have.been.called;
    });

    it('should insert budget category links and ignore conflicts', async () => {
      await budgetRepo.saveBudgetCategories(5, [10, 11]);

      insertStub.should.have.been.calledOnceWithExactly(budgetToCategories);
      insertValuesStub.should.have.been.calledOnceWithExactly([
        { budgetId: 5, categoryId: 10 },
        { budgetId: 5, categoryId: 11 },
      ]);
      onConflictDoNothingStub.should.have.been.calledOnce;
    });
  });

  describe('deleteBudgetCategories', () => {
    it('should delete category links for the given budget', async () => {
      await budgetRepo.deleteBudgetCategories(5);

      deleteStub.should.have.been.calledOnceWithExactly(budgetToCategories);
      deleteWhereStub.should.have.been.calledOnce;
      chai.assert.exists(deleteWhereStub.firstCall.args[0]);
    });
  });

  describe('listBudgetsWithCategories', () => {
    it('should list budgets with category junction rows flattened', async () => {
      const persistedCategory = {
        id: 10,
        name: 'Food',
        userId: 1,
        parentCategoryId: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: null,
      };
      const persistedBudget = {
        id: 5,
        name: 'Groceries',
        value: '500.00',
        type: 'monthly',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        userId: 1,
        createdAt: new Date('2026-01-01'),
        updatedAt: null,
      };
      findManyStub.resolves([{
        ...persistedBudget,
        categories: [{ category: persistedCategory }],
      }]);

      const result = await requestContext.run({ userId: 1, isAdmin: false }, async () => (
        budgetRepo.listBudgetsWithCategories()
      ));

      findManyStub.should.have.been.calledOnce;
      findManyStub.firstCall.args[0].should.deep.include({
        with: {
          categories: {
            with: {
              category: true,
            },
          },
        },
      });
      chai.assert.exists(findManyStub.firstCall.args[0].where);
      result.should.deep.equal([{
        ...persistedBudget,
        categories: [persistedCategory],
      }]);
    });
  });
});
