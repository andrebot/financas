import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import sinonChai from 'sinon-chai';
import { cards } from '../../../../src/server/resources/models/accountModel';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';
import { requestContext } from '../../../../src/server/utils/authorization';
import type { ICardRepo } from '../../../../src/server/types';

chai.use(sinonChai);
chai.should();

const runWithContext = <T>(fn: () => Promise<T>): Promise<T> =>
  requestContext.run({ userId: 1, isAdmin: true }, fn)!;

const cardRepo = require('../../../../src/server/resources/repositories/cardRepo').default as ICardRepo;

type DrizzleDbStub = {
  select: SinonStub;
  insert: SinonStub;
  update: SinonStub;
  delete: SinonStub;
};

describe('CardRepo', () => {
  const dbHolder = databaseConnection as unknown as { db: DrizzleDbStub };

  let originalDb: unknown;
  let selectWhereStub: SinonStub;
  let insertValuesStub: SinonStub;
  let insertReturningStub: SinonStub;
  let updateSetStub: SinonStub;
  let updateWhereStub: SinonStub;
  let updateReturningStub: SinonStub;
  let deleteWhereStub: SinonStub;
  let deleteReturningStub: SinonStub;

  const savedCard = {
    id: 10,
    number: '4111111111111111',
    expirationDate: '12/30',
    accountId: 1,
    createdAt: new Date(),
    updatedAt: null,
  };

  before(() => {
    originalDb = dbHolder.db;
  });

  beforeEach(() => {
    selectWhereStub = sinon.stub().resolves([]);
    const selectFromStub = sinon.stub().returns({ where: selectWhereStub });
    const selectStub = sinon.stub().returns({ from: selectFromStub });

    insertReturningStub = sinon.stub().resolves([savedCard]);
    insertValuesStub = sinon.stub().returns({ returning: insertReturningStub });
    const insertStub = sinon.stub().returns({ values: insertValuesStub });

    updateReturningStub = sinon.stub().resolves([savedCard]);
    updateWhereStub = sinon.stub().returns({ returning: updateReturningStub });
    updateSetStub = sinon.stub().returns({ where: updateWhereStub });
    const updateStub = sinon.stub().returns({ set: updateSetStub });

    deleteReturningStub = sinon.stub().resolves([savedCard]);
    deleteWhereStub = sinon.stub().returns({ returning: deleteReturningStub });
    const deleteStub = sinon.stub().returns({ where: deleteWhereStub });

    dbHolder.db = {
      select: selectStub,
      insert: insertStub,
      update: updateStub,
      delete: deleteStub,
    };
  });

  afterEach(() => {
    dbHolder.db = originalDb as DrizzleDbStub;
  });

  describe('findByAccountId', () => {
    it('should return cards for the given account', async () => {
      selectWhereStub.resolves([savedCard]);

      const result = await runWithContext(() => cardRepo.findByAccountId(1));

      dbHolder.db.select.should.have.been.calledOnce;
      selectWhereStub.should.have.been.calledOnce;
      result.should.deep.equal([savedCard]);
    });
  });

  describe('syncAccountCards', () => {
    it('should insert submitted cards without ids', async () => {
      const result = await runWithContext(() => cardRepo.syncAccountCards(1, [{
        number: savedCard.number,
        expirationDate: savedCard.expirationDate,
      }]));

      dbHolder.db.insert.should.have.been.calledOnceWithExactly(cards);
      insertValuesStub.should.have.been.calledOnceWithExactly({
        accountId: 1,
        number: savedCard.number,
        expirationDate: savedCard.expirationDate,
      });
      result.should.deep.equal([savedCard]);
    });

    it('should update submitted cards with ids that belong to the account', async () => {
      selectWhereStub.resolves([savedCard]);

      await runWithContext(() => cardRepo.syncAccountCards(1, [{
        id: savedCard.id,
        number: '5555555555554444',
        expirationDate: '01/31',
      }]));

      dbHolder.db.update.should.have.been.calledOnceWithExactly(cards);
      updateSetStub.should.have.been.calledOnceWithExactly({
        number: '5555555555554444',
        expirationDate: '01/31',
      });
    });

    it('should delete existing cards omitted from the submitted full list', async () => {
      selectWhereStub.resolves([savedCard]);

      const result = await runWithContext(() => cardRepo.syncAccountCards(1, []));

      dbHolder.db.delete.should.have.been.calledOnceWithExactly(cards);
      deleteWhereStub.should.have.been.calledOnce;
      result.should.deep.equal([]);
    });

    it('should reject submitted ids that do not belong to the account', async () => {
      selectWhereStub.resolves([{ ...savedCard, id: 10 }]);

      try {
        await runWithContext(() => cardRepo.syncAccountCards(1, [{
          id: 999,
          number: '5555555555554444',
          expirationDate: '01/31',
        }]));
        chai.assert.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('Card id 999 does not belong to account 1');
      }
    });
  });
});
