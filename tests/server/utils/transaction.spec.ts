import { should } from 'chai';
import sinon, { SinonStub } from 'sinon';
import proxyquire from 'proxyquire';

describe('transaction utils', () => {
  let transactionStub: SinonStub;
  let dbMock: { transaction: SinonStub };
  let withTransaction: <T>(fn: () => Promise<T>) => Promise<T>;
  let getDb: () => unknown;

  beforeEach(() => {
    transactionStub = sinon.stub();
    dbMock = { transaction: transactionStub };

    ({ withTransaction, getDb } = proxyquire('../../../src/server/utils/transaction', {
      './databaseConnection': { db: dbMock },
    }));
  });

  describe('withTransaction', () => {
    it('should run the function inside a db transaction and return the result', async () => {
      const expected = { done: true };
      transactionStub.callsFake((callback: (tx: unknown) => Promise<unknown>) =>
        callback({}),
      );
      const fn = sinon.stub().resolves(expected);

      const result = await withTransaction(fn);

      transactionStub.should.have.been.calledOnce;
      fn.should.have.been.calledOnce;
      (result as typeof expected).should.deep.equal(expected);
    });

    it('should propagate errors thrown inside the transaction', async () => {
      transactionStub.callsFake((callback: (tx: unknown) => Promise<unknown>) =>
        callback({}),
      );
      const fn = sinon.stub().rejects(new Error('rollback'));

      try {
        await withTransaction(fn);
        should().fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('rollback');
      }
    });
  });

  describe('getDb', () => {
    it('should return the global db when no transaction is active', () => {
      const result = getDb();

      (result as typeof dbMock).should.equal(dbMock);
    });

    it('should return the transaction client when inside a transaction', async () => {
      const txClient = { isTx: true };
      transactionStub.callsFake((callback: (tx: unknown) => Promise<unknown>) =>
        callback(txClient),
      );

      let capturedDb: unknown;
      await withTransaction(async () => {
        capturedDb = getDb();
      });

      should().exist(capturedDb);
      capturedDb!.should.equal(txClient);
    });
  });
});
