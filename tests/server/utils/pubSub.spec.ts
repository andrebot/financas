import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import PubSub from '../../../src/server/utils/pubSub';

chai.use(sinonChai);
chai.should();

type TestEvents = {
  created: { id: number; name: string };
  deleted: { id: number };
  updated: { id: number; value: string };
};

describe('PubSub', () => {
  let pubSub: ReturnType<typeof PubSub<TestEvents>>;

  beforeEach(() => {
    pubSub = PubSub<TestEvents>();
  });

  describe('subscribe', () => {
    it('should call the handler when the subscribed event is published', async () => {
      const handler = sinon.stub();
      pubSub.subscribe('created', handler);

      await pubSub.publish('created', { id: 1, name: 'item' });

      handler.should.have.been.calledOnceWith({ id: 1, name: 'item' });
    });

    it('should call all handlers registered for the same event', async () => {
      const handlerA = sinon.stub();
      const handlerB = sinon.stub();
      pubSub.subscribe('created', handlerA);
      pubSub.subscribe('created', handlerB);

      await pubSub.publish('created', { id: 2, name: 'item' });

      handlerA.should.have.been.calledOnce;
      handlerB.should.have.been.calledOnce;
    });

    it('should not call a handler for a different event', async () => {
      const handler = sinon.stub();
      pubSub.subscribe('deleted', handler);

      await pubSub.publish('created', { id: 1, name: 'item' });

      handler.should.not.have.been.called;
    });

    it('should not call the handler after unsubscribing', async () => {
      const handler = sinon.stub();
      const unsubscribe = pubSub.subscribe('created', handler);

      unsubscribe();
      await pubSub.publish('created', { id: 1, name: 'item' });

      handler.should.not.have.been.called;
    });

    it('should only remove the unsubscribed handler, leaving others intact', async () => {
      const handlerA = sinon.stub();
      const handlerB = sinon.stub();
      const unsubscribeA = pubSub.subscribe('created', handlerA);
      pubSub.subscribe('created', handlerB);

      unsubscribeA();
      await pubSub.publish('created', { id: 1, name: 'item' });

      handlerA.should.not.have.been.called;
      handlerB.should.have.been.calledOnce;
    });

    it('should allow the same handler to subscribe to multiple events independently', async () => {
      const handler = sinon.stub();
      pubSub.subscribe('created', handler);
      pubSub.subscribe('deleted', handler);

      await pubSub.publish('created', { id: 1, name: 'item' });
      await pubSub.publish('deleted', { id: 2 });

      handler.should.have.been.calledTwice;
    });
  });

  describe('publish', () => {
    it('should resolve without calling any handler when no subscribers exist', async () => {
      await pubSub.publish('created', { id: 1, name: 'item' });
    });

    it('should await async handlers before resolving', async () => {
      const order: string[] = [];
      pubSub.subscribe('created', async () => {
        await Promise.resolve();
        order.push('handler');
      });

      await pubSub.publish('created', { id: 1, name: 'item' });
      order.push('after publish');

      order.should.deep.equal(['handler', 'after publish']);
    });

    it('should run all handlers in parallel', async () => {
      const started: number[] = [];
      const finished: number[] = [];

      pubSub.subscribe('created', async () => {
        started.push(1);
        await Promise.resolve();
        finished.push(1);
      });

      pubSub.subscribe('created', async () => {
        started.push(2);
        await Promise.resolve();
        finished.push(2);
      });

      await pubSub.publish('created', { id: 1, name: 'item' });

      started.should.deep.equal([1, 2]);
    });

    it('should reject when a handler rejects', async () => {
      pubSub.subscribe('created', async () => {
        throw new Error('handler failed');
      });

      try {
        await pubSub.publish('created', { id: 1, name: 'item' });
        chai.assert.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('handler failed');
      }
    });

    it('should pass the correct payload to the handler', async () => {
      const handler = sinon.stub();
      pubSub.subscribe('updated', handler);

      await pubSub.publish('updated', { id: 5, value: 'new-value' });

      handler.should.have.been.calledWith({ id: 5, value: 'new-value' });
    });
  });
});
