import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import budgetRepo from '../../../../src/server/resources/repositories/budgetRepo';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';
import { budgets, budgetToCategories } from '../../../../src/server/resources/models/budgetModel';
import type { ITransaction } from '../../../../src/server/types';

describe('Budget Repository', function () {
  const dbHolder = databaseConnection as unknown as { db: { update: SinonStub } };

  let originalDb: unknown;
  let updateStub: SinonStub;
  let setStub: SinonStub;
  let fromStub: SinonStub;
  let whereStub: SinonStub;

  before(() => {
    originalDb = dbHolder.db;
  });

  beforeEach(() => {
    whereStub = sinon.stub().resolves();
    fromStub = sinon.stub().returns({ where: whereStub });
    setStub = sinon.stub().returns({ from: fromStub });
    updateStub = sinon.stub().returns({ set: setStub });
    dbHolder.db = { update: updateStub };
  });

  afterEach(() => {
    dbHolder.db = originalDb as { update: SinonStub };
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

  it('should skip update when the transaction has no category', async () => {
    const mockTransaction = buildTxn({ categoryId: null });

    await budgetRepo.updateBudgetsByNewTransaction(mockTransaction);

    updateStub.should.not.have.been.called;
  });

  it('should update budgets scoped by category and date bounds', async () => {
    const mockTransaction = buildTxn({
      categoryId: 42,
      date: new Date('2026-03-01'),
      value: '50.50',
    });

    await budgetRepo.updateBudgetsByNewTransaction(mockTransaction);

    updateStub.should.have.been.calledOnceWithExactly(budgets);
    setStub.should.have.been.calledOnce;
    setStub.firstCall.args[0].should.have.keys('value');
    fromStub.should.have.been.calledOnceWithExactly(budgetToCategories);
    whereStub.should.have.been.calledOnce;
    chai.assert.exists(whereStub.firstCall.args[0]);
  });
});
