import { Request, Response } from 'express';
import sinon from 'sinon';
import { getTransactionTypes } from '../../../src/server/controllers/transaction';
import { TRANSACTION_TYPES, INVESTMENT_TYPES } from '../../../src/server/resources/transactionModel';

describe('Transaction controller', () => {
  it('should retrieve all transaction types', () => {
    const req = {};
    const res = {
      send: sinon.spy(),
    };

    getTransactionTypes(req as Request, res as unknown as Response);

    res.send.should.have.been.calledWith({
      transactionTypes: Object.values(TRANSACTION_TYPES),
      investmentTypes: Object.values(INVESTMENT_TYPES),
    });
  });
});