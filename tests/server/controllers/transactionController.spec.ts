import { Response } from 'express';
import sinon from 'sinon';
import { should } from 'chai';
import TransactionController from '../../../src/server/controllers/transactionController';
import { TRANSACTION_TYPES, INVESTMENT_TYPES, RequestWithUser } from '../../../src/server/types';

describe('Transaction controller', () => {
  it('should retrieve all transaction types', () => {
    const req = {
      user: {
        id: '123',
      },
    };
    const res = {
      send: sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    TransactionController.getTransactionTypes(req as RequestWithUser, res as unknown as Response);

    res.send.should.have.been.calledWith({
      transactionTypes: Object.values(TRANSACTION_TYPES),
      investmentTypes: Object.values(INVESTMENT_TYPES),
    });
  });

  it('should throw 500 error if user is not found', async () => {
    const errorMessage = 'User not authenticated to get Transaction';
    const request = {
      user: '',
    };
    const response = {
      status: sinon.stub().returnsThis(),
      send: sinon.spy(),
    };

    try {
      await TransactionController.getTransactionTypes(request as unknown as RequestWithUser, response as unknown as Response);

      response.status.should.have.been.calledOnce;
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledOnce;
      response.send.should.have.been.calledWith({ error: errorMessage });
    } catch (error) {
      should().fail((error as Error).message);
    }
  });
});
