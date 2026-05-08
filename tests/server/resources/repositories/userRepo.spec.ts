import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import userRepo from '../../../../src/server/resources/repositories/userRepo';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';
import { users } from '../../../../src/server/resources/models/userModel';

describe('User Repository', () => {
  const dbHolder = databaseConnection as unknown as { db: { select: SinonStub } };

  let originalDb: unknown;
  let selectStub: SinonStub;
  let selectFromStub: SinonStub;
  let selectWhereStub: SinonStub;
  let selectLimitStub: SinonStub;

  before(() => {
    originalDb = dbHolder.db;
  });

  beforeEach(() => {
    selectLimitStub = sinon.stub().resolves([]);
    selectWhereStub = sinon.stub().returns({ limit: selectLimitStub });
    selectFromStub = sinon.stub().returns({ where: selectWhereStub });
    selectStub = sinon.stub().returns({ from: selectFromStub });
    dbHolder.db = { select: selectStub };
  });

  afterEach(() => {
    dbHolder.db = originalDb as { select: SinonStub };
  });

  it('should find a user by email when one exists', async () => {
    const email = 'test@test.com';
    const row = {
      id: 1,
      email,
      firstName: 'Test',
      lastName: 'User',
      role: 'user' as const,
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: null,
    };

    selectLimitStub.resolves([row]);

    const result = await userRepo.findByEmail(email);

    selectStub.should.have.been.calledOnce;
    selectFromStub.should.have.been.calledOnceWithExactly(users);
    selectWhereStub.should.have.been.calledOnce;
    selectLimitStub.should.have.been.calledOnceWithExactly(1);
    chai.assert.exists(selectWhereStub.firstCall.args[0]);

    chai.expect(result).to.deep.equal(row);
  });

  it('should return null when no user matches the email', async () => {
    selectLimitStub.resolves([]);

    const result = await userRepo.findByEmail('missing@example.com');

    chai.expect(result).to.be.null;
    selectLimitStub.should.have.been.calledOnceWithExactly(1);
  });
});
