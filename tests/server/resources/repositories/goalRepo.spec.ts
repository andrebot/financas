import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import sinonChai from 'sinon-chai';
import goalRepo from '../../../../src/server/resources/repositories/goalRepo';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';
import { goals } from '../../../../src/server/resources/models/goalModel';
import { investmentToGoals } from '../../../../src/server/resources/models/investmentModel';
import type { ITransaction } from '../../../../src/server/types';
import { requestContext } from '../../../../src/server/utils/authorization';

const runWithContext = (fn: () => Promise<unknown>) =>
  requestContext.run({ userId: 1, isAdmin: true }, fn);

chai.use(sinonChai);
chai.should();

describe('Goal Repository', () => {
  const dbHolder = databaseConnection as unknown as { db: { update: SinonStub; select: SinonStub } };

  let originalDb: unknown;
  let updateStub: SinonStub;
  let setStub: SinonStub;
  let fromStub: SinonStub;
  let whereStub: SinonStub;
  let selectStub: SinonStub;
  let selectFromStub: SinonStub;
  let selectWhereStub: SinonStub;

  before(() => {
    originalDb = dbHolder.db;
  });

  beforeEach(() => {
    whereStub = sinon.stub().resolves();
    fromStub = sinon.stub().returns({ where: whereStub });
    setStub = sinon.stub().returns({ from: fromStub });
    updateStub = sinon.stub().returns({ set: setStub });

    selectWhereStub = sinon.stub().resolves([]);
    selectFromStub = sinon.stub().returns({ where: selectWhereStub });
    selectStub = sinon.stub().returns({ from: selectFromStub });

    dbHolder.db = { update: updateStub, select: selectStub };
  });

  afterEach(() => {
    dbHolder.db = originalDb as { update: SinonStub; select: SinonStub };
  });

  function buildTransaction(overrides: Partial<ITransaction> = {}): ITransaction {
    return {
      id: 1,
      name: 'Test Transaction',
      categoryId: null,
      accountId: 3,
      type: 'transferIn',
      date: new Date(2024, 0, 15),
      value: '100.00',
      userId: 1,
      investmentType: null,
      createdAt: new Date(),
      updatedAt: null,
      ...overrides,
    } as ITransaction;
  }

  describe('updateGoalFromTransaction', () => {
    it('should do nothing when the transaction has no linked investments', async () => {
      selectWhereStub.resolves([]);

      await runWithContext(() => goalRepo.updateGoalFromTransaction(buildTransaction()));

      updateStub.should.not.have.been.called;
    });

    it('should update goals when linked investments exist', async () => {
      selectWhereStub.resolves([{ investmentId: 7 }]);

      await runWithContext(() => goalRepo.updateGoalFromTransaction(buildTransaction()));

      updateStub.should.have.been.calledOnceWithExactly(goals);
      setStub.should.have.been.calledOnce;
      setStub.firstCall.args[0].should.have.keys('savedValue');
      fromStub.should.have.been.calledOnceWithExactly(investmentToGoals);
      whereStub.should.have.been.calledOnce;
    });

    it('should call update when shouldInvertValue is true', async () => {
      selectWhereStub.resolves([{ investmentId: 7 }]);

      await runWithContext(() => goalRepo.updateGoalFromTransaction(buildTransaction({ value: '200.00' }), true));

      updateStub.should.have.been.calledOnceWithExactly(goals);
      setStub.should.have.been.calledOnce;
      whereStub.should.have.been.calledOnce;
    });

    it('should apply negative typeSign for outflow transaction types', async () => {
      selectWhereStub.resolves([{ investmentId: 7 }]);
      const outflowTransaction = buildTransaction({ type: 'cardPurchase', value: '50.00' });

      await runWithContext(() => goalRepo.updateGoalFromTransaction(outflowTransaction));

      updateStub.should.have.been.calledOnceWithExactly(goals);
      setStub.should.have.been.calledOnce;
      whereStub.should.have.been.calledOnce;
    });
  });

  describe('listGoalsWithSavedValueUpTo', () => {
    it('should query goals joined with investments and transactions up to the end of the given month', async () => {
      const mockGoals = [{ id: 1, name: 'Emergency Fund', savedValue: '500.00' }];
      const groupByStub = sinon.stub().resolves(mockGoals);
      const goalWhereStub = sinon.stub().returns({ groupBy: groupByStub });
      const leftJoinStub = sinon.stub();
      leftJoinStub.returns({ leftJoin: leftJoinStub, where: goalWhereStub });
      const goalFromStub = sinon.stub().returns({ leftJoin: leftJoinStub });
      selectStub.returns({ from: goalFromStub });

      const result = await runWithContext(() => goalRepo.listGoalsWithSavedValueUpTo(2026, 6));

      selectStub.should.have.been.calledOnce;
      goalFromStub.should.have.been.calledOnceWithExactly(goals);
      leftJoinStub.should.have.been.calledThrice;
      goalWhereStub.should.have.been.calledOnce;
      groupByStub.should.have.been.calledOnce;
      (result as typeof mockGoals).should.deep.equal(mockGoals);
    });

    it('should scope results to current user when not admin', async () => {
      const groupByStub = sinon.stub().resolves([]);
      const goalWhereStub = sinon.stub().returns({ groupBy: groupByStub });
      const leftJoinStub = sinon.stub();
      leftJoinStub.returns({ leftJoin: leftJoinStub, where: goalWhereStub });
      const goalFromStub = sinon.stub().returns({ leftJoin: leftJoinStub });
      selectStub.returns({ from: goalFromStub });

      await requestContext.run({ userId: 2, isAdmin: false }, () =>
        goalRepo.listGoalsWithSavedValueUpTo(2026, 1),
      );

      goalWhereStub.should.have.been.calledOnce;
      chai.assert.exists(goalWhereStub.firstCall.args[0]);
    });
  });
});
