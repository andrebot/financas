import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import sinonChai from 'sinon-chai';
import accountRepo from '../../../../src/server/resources/repositories/accountRepo';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';
import { requestContext } from '../../../../src/server/utils/authorization';

chai.use(sinonChai);
chai.should();

type DrizzleDbStub = {
  query: {
    accounts: {
      findMany: SinonStub;
    };
  };
};

describe('AccountRepo', () => {
  const dbHolder = databaseConnection as unknown as { db: DrizzleDbStub };

  let originalDb: unknown;
  let findManyStub: SinonStub;

  const accountWithCards = {
    id: 1,
    name: 'Checking',
    agency: '0001',
    accountNumber: '12345',
    currency: 'BRL',
    initialBalance: '0.00',
    userId: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: null,
    cards: [
      {
        id: 10,
        number: '4111111111111111',
        expirationDate: '12/30',
        accountId: 1,
        createdAt: new Date('2026-01-01'),
        updatedAt: null,
      },
    ],
  };

  before(() => {
    originalDb = dbHolder.db;
  });

  beforeEach(() => {
    findManyStub = sinon.stub().resolves([accountWithCards]);

    dbHolder.db = {
      query: {
        accounts: {
          findMany: findManyStub,
        },
      },
    };
  });

  afterEach(() => {
    dbHolder.db = originalDb as DrizzleDbStub;
  });

  describe('listAllWithCards', () => {
    it('should list non-admin accounts with cards and tenant scope', async () => {
      const result = await requestContext.run({ userId: 1, isAdmin: false }, async () => {
        return accountRepo.listAllWithCards();
      });

      findManyStub.should.have.been.calledOnce;
      findManyStub.firstCall.args[0].should.have.property('where');
      findManyStub.firstCall.args[0].should.deep.include({ with: { cards: true } });
      result!.should.deep.equal([accountWithCards]);
    });

    it('should list admin accounts with cards without tenant scope', async () => {
      const result = await requestContext.run({ userId: 1, isAdmin: true }, async () => {
        return accountRepo.listAllWithCards();
      });

      findManyStub.should.have.been.calledOnceWithExactly({
        with: { cards: true },
      });
      result!.should.deep.equal([accountWithCards]);
    });
  });
});
