import { Request, Response } from 'express';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import budgetModel from '../../../src/server/resources/budgetModel';

const getBudgetStub = sinon.stub().resolves({});

const budgetController = proxyquire('../../../src/server/controllers/budgetController', {
  '../managers/contentManager': {
    getBudget: getBudgetStub,
  },
}).default;

describe('Budget controller', () => {
  it('should call getBudget with the right parameters', async () => {
    const req = {
      params: {
        id: '123',
      },
      user: {
        id: '456',
      },
    } as unknown as Request;
    const res = {
      send: sinon.spy(),
    } as unknown as Response;

    await budgetController.getContent(req, res);

    getBudgetStub.should.have.been.calledWith('123', budgetModel, '456');
    res.send.should.have.been.calledWith({});
  });

  it('should handle errors', async () => {
    const req = {
      params: {
        id: '123',
      },
      user: {
        id: '456',
      },
    } as unknown as Request;
    const res = {
      send: sinon.spy(),
      status: sinon.stub().returnsThis(),
    } as unknown as Response;

    getBudgetStub.rejects(new Error('Test error'));

    await budgetController.getContent(req, res);

    res.send.should.have.been.calledWith({ error: 'Test error' });
    res.status.should.have.been.calledWith(500);
  });
});