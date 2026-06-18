import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { subscribe, publish, clear, EVENTS } from '../../../src/server/utils/pubSub';
import type { ITransaction, IInvestment } from '../../../src/server/types';

chai.use(sinonChai);
chai.should();

function buildTransaction(overrides: Partial<ITransaction> = {}): ITransaction {
  return {
    id: 1,
    name: 'Test',
    categoryId: null,
    accountId: 1,
    type: 'expense',
    date: new Date(2024, 0, 1),
    value: '100.00',
    userId: 1,
    investmentType: null,
    createdAt: new Date(),
    updatedAt: null,
    ...overrides,
  } as ITransaction;
}

function buildInvestment(overrides: Partial<IInvestment> = {}): IInvestment {
  return {
    id: 1,
    name: 'CDB Nubank',
    investmentType: 'cdb',
    totalInvested: '1000.00',
    quantity: null,
    averagePrice: null,
    archived: false,
    userId: 1,
    createdAt: new Date(),
    updatedAt: null,
    ...overrides,
  } as IInvestment;
}

describe('pubSub', () => {
  beforeEach(() => {
    clear();
  });

  describe('subscribe', () => {
    it('should call the handler when the subscribed event is published', async () => {
      const handler = sinon.stub();
      const tx = buildTransaction();
      subscribe(EVENTS.TRANSACTION_CREATED, handler);

      await publish(EVENTS.TRANSACTION_CREATED, tx);

      handler.should.have.been.calledOnceWith(tx);
    });

    it('should call all handlers registered for the same event', async () => {
      const handlerA = sinon.stub();
      const handlerB = sinon.stub();
      const tx = buildTransaction();
      subscribe(EVENTS.TRANSACTION_CREATED, handlerA);
      subscribe(EVENTS.TRANSACTION_CREATED, handlerB);

      await publish(EVENTS.TRANSACTION_CREATED, tx);

      handlerA.should.have.been.calledOnce;
      handlerB.should.have.been.calledOnce;
    });

    it('should not call a handler for a different event', async () => {
      const handler = sinon.stub();
      subscribe(EVENTS.TRANSACTION_DELETED, handler);

      await publish(EVENTS.TRANSACTION_CREATED, buildTransaction());

      handler.should.not.have.been.called;
    });

    it('should not call the handler after unsubscribing', async () => {
      const handler = sinon.stub();
      const unsubscribe = subscribe(EVENTS.TRANSACTION_CREATED, handler);

      unsubscribe();
      await publish(EVENTS.TRANSACTION_CREATED, buildTransaction());

      handler.should.not.have.been.called;
    });

    it('should only remove the unsubscribed handler, leaving others intact', async () => {
      const handlerA = sinon.stub();
      const handlerB = sinon.stub();
      const unsubscribeA = subscribe(EVENTS.TRANSACTION_CREATED, handlerA);
      subscribe(EVENTS.TRANSACTION_CREATED, handlerB);

      unsubscribeA();
      await publish(EVENTS.TRANSACTION_CREATED, buildTransaction());

      handlerA.should.not.have.been.called;
      handlerB.should.have.been.calledOnce;
    });

    it('should allow the same handler to subscribe to multiple events independently', async () => {
      const handler = sinon.stub();
      subscribe(EVENTS.INVESTMENT_CREATED, handler);
      subscribe(EVENTS.INVESTMENT_ARCHIVED, handler);

      await publish(EVENTS.INVESTMENT_CREATED, buildInvestment());
      await publish(EVENTS.INVESTMENT_ARCHIVED, buildInvestment());

      handler.should.have.been.calledTwice;
    });
  });

  describe('publish', () => {
    it('should resolve without calling any handler when no subscribers exist', async () => {
      await publish(EVENTS.TRANSACTION_CREATED, buildTransaction());
    });

    it('should await async handlers before resolving', async () => {
      const order: string[] = [];
      subscribe(EVENTS.TRANSACTION_UPDATED, async () => {
        await Promise.resolve();
        order.push('handler');
      });

      await publish(EVENTS.TRANSACTION_UPDATED, buildTransaction());
      order.push('after publish');

      order.should.deep.equal(['handler', 'after publish']);
    });

    it('should run all handlers in parallel', async () => {
      const started: number[] = [];

      subscribe(EVENTS.TRANSACTION_CREATED, async () => {
        started.push(1);
        await Promise.resolve();
      });

      subscribe(EVENTS.TRANSACTION_CREATED, async () => {
        started.push(2);
        await Promise.resolve();
      });

      await publish(EVENTS.TRANSACTION_CREATED, buildTransaction());

      started.should.deep.equal([1, 2]);
    });

    it('should reject when a handler rejects', async () => {
      subscribe(EVENTS.TRANSACTION_CREATED, async () => {
        throw new Error('handler failed');
      });

      try {
        await publish(EVENTS.TRANSACTION_CREATED, buildTransaction());
        chai.assert.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('handler failed');
      }
    });

    it('should pass the correct payload to the handler', async () => {
      const handler = sinon.stub();
      const investment = buildInvestment({ name: 'LCI Itaú' });
      subscribe(EVENTS.INVESTMENT_ARCHIVED, handler);

      await publish(EVENTS.INVESTMENT_ARCHIVED, investment);

      handler.should.have.been.calledWith(investment);
    });
  });

  describe('clear', () => {
    it('should remove all subscribers so publish becomes a no-op', async () => {
      const handler = sinon.stub();
      subscribe(EVENTS.TRANSACTION_CREATED, handler);

      clear();
      await publish(EVENTS.TRANSACTION_CREATED, buildTransaction());

      handler.should.not.have.been.called;
    });
  });
});
