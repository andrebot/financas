import chai from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

const accessTokenValidationStub = sinon.stub().callsFake(() => (_req: any, _res: any, next: any) => next());

const transactionControllerStub = {
  listContent: sinon.stub(),
  createContent: sinon.stub(),
  getContent: sinon.stub(),
  updateContent: sinon.stub(),
  deleteContent: sinon.stub(),
  getTransactionTypes: sinon.stub(),
};

const transactionRouter = proxyquire('../../../src/server/routes/transaction', {
  '../controllers/transactionController': {
    default: transactionControllerStub,
  },
  '../utils/authorization': {
    default: accessTokenValidationStub,
  },
}).default;

describe('Transaction routes', () => {
  const idPattern = '/:id([0-9a-fA-F]{24})';

  beforeEach(() => {
    accessTokenValidationStub.resetHistory();
  });

  it('should return an Express Router', () => {
    transactionRouter.should.have.property('stack');
    transactionRouter.stack.should.be.an('array');
    chai.expect(transactionRouter).to.be.a('function');
  });

  it('should register 6 routes (5 CRUD from routeFactory + GET /types)', () => {
    transactionRouter.stack.should.have.lengthOf(6);
  });

  it('should register GET /types for getTransactionTypes with auth middleware', () => {
    const typesRoute = transactionRouter.stack.find(
      (layer: any) => layer.route?.path === '/types' && layer.route?.methods?.get,
    );
    chai.expect(typesRoute).to.exist;
    typesRoute.route.stack.should.have.lengthOf(2);
  });

  it('should register standard CRUD routes', () => {
    const hasListRoute = transactionRouter.stack.some(
      (layer: any) => layer.route?.path === '/' && layer.route?.methods?.get,
    );
    const hasCreateRoute = transactionRouter.stack.some(
      (layer: any) => layer.route?.path === '/' && layer.route?.methods?.post,
    );
    const hasGetByIdRoute = transactionRouter.stack.some(
      (layer: any) => layer.route?.path === idPattern && layer.route?.methods?.get,
    );
    const hasUpdateRoute = transactionRouter.stack.some(
      (layer: any) => layer.route?.path === idPattern && layer.route?.methods?.put,
    );
    const hasDeleteRoute = transactionRouter.stack.some(
      (layer: any) => layer.route?.path === idPattern && layer.route?.methods?.delete,
    );

    hasListRoute.should.be.true;
    hasCreateRoute.should.be.true;
    hasGetByIdRoute.should.be.true;
    hasUpdateRoute.should.be.true;
    hasDeleteRoute.should.be.true;
  });

});
