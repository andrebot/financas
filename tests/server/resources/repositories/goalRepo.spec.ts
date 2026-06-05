import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import sinonChai from 'sinon-chai';
import goalRepo from '../../../../src/server/resources/repositories/goalRepo';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';
import { goals } from '../../../../src/server/resources/models/goalModel';
import { transactionToGoals } from '../../../../src/server/resources/models/transactionModel';
import type { ITransaction } from '../../../../src/server/types';
import { requestContext } from '../../../../src/server/utils/authorization';

const runWithContext = (fn: () => Promise<unknown>) =>
  requestContext.run({ userId: 1, isAdmin: true }, fn);

chai.use(sinonChai);
chai.should();

describe('Goal Repository', () => {
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
    it('should call update on the goals table with the correct chain', async () => {
      const transaction = buildTransaction();

      await runWithContext(() => goalRepo.updateGoalFromTransaction(transaction));

      updateStub.should.have.been.calledOnceWithExactly(goals);
      setStub.should.have.been.calledOnce;
      setStub.firstCall.args[0].should.have.keys('savedValue');
      fromStub.should.have.been.calledOnceWithExactly(transactionToGoals);
      whereStub.should.have.been.calledOnce;
      chai.assert.exists(whereStub.firstCall.args[0]);
    });

    it('should call update when shouldInvertValue is true', async () => {
      const transaction = buildTransaction({ value: '200.00' });

      await runWithContext(() => goalRepo.updateGoalFromTransaction(transaction, true));

      updateStub.should.have.been.calledOnceWithExactly(goals);
      setStub.should.have.been.calledOnce;
      whereStub.should.have.been.calledOnce;
    });

    it('should call update when shouldInvertValue defaults to false', async () => {
      const transaction = buildTransaction();

      await runWithContext(() => goalRepo.updateGoalFromTransaction(transaction));

      updateStub.should.have.been.calledOnce;
    });
  });
});
