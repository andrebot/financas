import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import goalRepo from '../../../../src/server/resources/repositories/goalRepo';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';
import { goals } from '../../../../src/server/resources/models/goalModel';

describe('Goal Repository', () => {
  const dbHolder = databaseConnection as unknown as { db: { update: SinonStub } };

  let originalDb: unknown;
  let updateStub: SinonStub;
  let setStub: SinonStub;
  let whereStub: SinonStub;

  before(() => {
    originalDb = dbHolder.db;
  });

  beforeEach(() => {
    whereStub = sinon.stub().resolves();
    const fromStub = sinon.stub().returns({ where: whereStub });
    setStub = sinon.stub().returns({ from: fromStub });
    updateStub = sinon.stub().returns({ set: setStub });
    dbHolder.db = { update: updateStub };
  });

  afterEach(() => {
    dbHolder.db = originalDb as { update: SinonStub };
  });

  it('should update goals from a bulk goals update', async () => {
    const bulk = [
      { goalId: 1, amount: 100 },
      { goalId: 2, amount: 200 },
      { goalId: 3, amount: 300 },
    ];

    await goalRepo.incrementGoalsInBulk(bulk);

    updateStub.should.have.been.calledOnceWithExactly(goals);
    setStub.should.have.been.calledOnce;
    setStub.firstCall.args[0].should.have.keys('value');
    whereStub.should.have.been.calledOnce;
    chai.assert.exists(whereStub.firstCall.args[0]);
  });

  it('should not run a DB update when no goals are provided', async () => {
    await goalRepo.incrementGoalsInBulk([]);

    updateStub.should.not.have.been.called;
  });
});
