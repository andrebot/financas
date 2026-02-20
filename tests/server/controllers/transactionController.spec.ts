import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import { Response } from 'express';
import {
  TRANSACTION_TYPES,
  INVESTMENT_TYPES,
  RequestWithUser,
} from '../../../src/server/types';

chai.use(sinonChai);
chai.should();

type MockResponse = {
  send: sinon.SinonStub;
  status: sinon.SinonStub;
};

type MockRequest = {
  body?: Record<string, unknown>;
  params: Record<string, string>;
  user?: {
    id: string;
    role: 'admin' | 'user';
    email?: string;
  };
};

const transactionTypesResponse = {
  transactionTypes: Object.values(TRANSACTION_TYPES),
  investmentTypes: Object.values(INVESTMENT_TYPES),
};

const accountantManagerInstance = {
  createTransaction: sinon.stub(),
  updateTransaction: sinon.stub(),
  deleteTransaction: sinon.stub(),
  listTransactions: sinon.stub(),
  getTransaction: sinon.stub(),
  getTransactionTypes: sinon.stub().returns(transactionTypesResponse),
};

const accountantManagerStub = sinon.stub().returns(accountantManagerInstance);

const handleErrorStub = sinon.stub().callsFake((error: Error, res: MockResponse) => {
  (res as unknown as Response).status(500);
  (res as unknown as Response).send({ error: error.message });
  return res as unknown as Response;
});

const {
  default: controller,
  TransactionController: TransactionControllerFactory,
  getTransactionTypes: getTransactionTypesFn,
} = proxyquire('../../../src/server/controllers/transactionController', {
  '../managers/accountantManager': {
    default: accountantManagerInstance,
    AccountantManager: accountantManagerStub,
  },
  '../utils/responseHandlers': {
    handleError: handleErrorStub,
  },
});

describe('Transaction controller', () => {
  let response: MockResponse;
  let request: MockRequest;

  beforeEach(() => {
    response = {
      send: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis(),
    };

    request = {
      body: { name: 'Test Transaction', user: 'user-123' },
      params: { id: 'transaction-123' },
      user: {
        id: 'user-123',
        role: 'user',
        email: 'user@test.com',
      },
    };

    accountantManagerInstance.createTransaction.resetHistory();
    accountantManagerInstance.updateTransaction.resetHistory();
    accountantManagerInstance.deleteTransaction.resetHistory();
    accountantManagerInstance.listTransactions.resetHistory();
    accountantManagerInstance.getTransaction.resetHistory();
    accountantManagerInstance.getTransactionTypes.resetHistory();
    accountantManagerInstance.getTransactionTypes.returns(transactionTypesResponse);
    handleErrorStub.resetHistory();
  });

  describe('getTransactionTypes', () => {
    it('should retrieve all transaction types', () => {
      controller.getTransactionTypes(
        request as RequestWithUser,
        response as unknown as Response,
      );

      accountantManagerInstance.getTransactionTypes.should.have.been.calledOnce;
      response.send.should.have.been.calledOnce;
      response.send.should.have.been.calledWith(transactionTypesResponse);
    });

    it('should reject when user is not authenticated', () => {
      request.user = undefined;

      controller.getTransactionTypes(
        request as RequestWithUser,
        response as unknown as Response,
      );

      accountantManagerInstance.getTransactionTypes.should.not.have.been.called;
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({
        error: 'User not authenticated to get Transaction',
      });
    });

    it('should handle manager errors', () => {
      const error = new Error('Get transaction types failed');
      accountantManagerInstance.getTransactionTypes.throws(error);

      controller.getTransactionTypes(
        request as RequestWithUser,
        response as unknown as Response,
      );

      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({ error: error.message });
    });

    it('should use handleError by default when errorHandler is omitted', () => {
      request.user = undefined;

      getTransactionTypesFn(
        request as RequestWithUser,
        response as unknown as Response,
        accountantManagerInstance,
      );

      handleErrorStub.should.have.been.calledOnce;
      handleErrorStub.should.have.been.calledWith(
        sinon.match.instanceOf(Error),
        response,
      );
      response.status.should.have.been.calledWith(500);
    });
  });

  describe('createContent', () => {
    it('should create a transaction successfully', async () => {
      const mockTransaction = { id: 'tx-1', ...request.body };
      accountantManagerInstance.createTransaction.resolves(mockTransaction);

      await controller.createContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      accountantManagerInstance.createTransaction.should.have.been.calledOnce;
      accountantManagerInstance.createTransaction.should.have.been.calledWith(
        request.body,
      );
      response.send.should.have.been.calledOnce;
      response.send.should.have.been.calledWith(mockTransaction);
    });
  });

  describe('updateContent', () => {
    it('should update a transaction successfully', async () => {
      const mockTransaction = { id: 'tx-1', ...request.body };
      accountantManagerInstance.updateTransaction.resolves(mockTransaction);

      await controller.updateContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      accountantManagerInstance.updateTransaction.should.have.been.calledOnce;
      accountantManagerInstance.updateTransaction.should.have.been.calledWith(
        request.params.id,
        request.body,
        request.user?.id,
        false,
      );
      response.send.should.have.been.calledWith(mockTransaction);
    });
  });

  describe('deleteContent', () => {
    it('should delete a transaction successfully', async () => {
      const mockTransaction = { id: 'tx-1', ...request.body };
      accountantManagerInstance.deleteTransaction.resolves(mockTransaction);

      await controller.deleteContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      accountantManagerInstance.deleteTransaction.should.have.been.calledOnce;
      accountantManagerInstance.deleteTransaction.should.have.been.calledWith(
        request.params.id,
        request.user?.id,
        false,
      );
      response.send.should.have.been.calledWith(mockTransaction);
    });
  });

  describe('listContent', () => {
    it('should list transactions successfully', async () => {
      const mockTransactions = [{ id: 'tx-1', ...request.body }];
      accountantManagerInstance.listTransactions.resolves(mockTransactions);

      await controller.listContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      accountantManagerInstance.listTransactions.should.have.been.calledOnce;
      accountantManagerInstance.listTransactions.should.have.been.calledWith(
        request.user?.id,
      );
      response.send.should.have.been.calledWith(mockTransactions);
    });
  });

  describe('getContent', () => {
    it('should get a transaction successfully', async () => {
      const mockTransaction = { id: 'tx-1', ...request.body };
      accountantManagerInstance.getTransaction.resolves(mockTransaction);

      await controller.getContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      accountantManagerInstance.getTransaction.should.have.been.calledOnce;
      accountantManagerInstance.getTransaction.should.have.been.calledWith(
        request.params.id,
        request.user?.id,
        false,
      );
      response.send.should.have.been.calledWith(mockTransaction);
    });
  });

  describe('TransactionController factory', () => {
    it('should accept custom error handler', async () => {
      const customErrorHandler = sinon.stub().callsFake((error: Error, res: MockResponse) => {
        (res as unknown as Response).status(400);
        (res as unknown as Response).send({ error: error.message });
        return res as unknown as Response;
      });

      const customController = TransactionControllerFactory(customErrorHandler);

      request.user = undefined;
      customController.getTransactionTypes(
        request as RequestWithUser,
        response as unknown as Response,
      );

      customErrorHandler.should.have.been.calledOnce;
      response.status.should.have.been.calledWith(400);
    });

    it('should use handleError by default when omitted', () => {
      const controllerWithDefault = TransactionControllerFactory();
      request.user = undefined;

      controllerWithDefault.getTransactionTypes(
        request as RequestWithUser,
        response as unknown as Response,
      );

      handleErrorStub.should.have.been.calledOnce;
      handleErrorStub.should.have.been.calledWith(
        sinon.match.instanceOf(Error),
        response,
      );
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({
        error: 'User not authenticated to get Transaction',
      });
    });
  });
});
