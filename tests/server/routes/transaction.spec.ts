import chai from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

const accessTokenValidationStub = sinon.stub().callsFake(() => (_req: any, _res: any, next: any) => next());

const accountantControllerStub = {
  listContent: sinon.stub(),
  createContent: sinon.stub(),
  getContent: sinon.stub(),
  updateContent: sinon.stub(),
  deleteContent: sinon.stub(),
  getTransactionTypes: sinon.stub(),
  listMonthlyBalances: sinon.stub(),
};

const accountantRouter = proxyquire('../../../src/server/routes/accountant', {
  '../controllers/accountantController': {
    default: accountantControllerStub,
  },
  '../utils/authorization': {
    default: accessTokenValidationStub,
  },
}).default;

describe('Accountant routes', () => {
  const idPattern = '/:id([0-9]+)';

  beforeEach(() => {
    accessTokenValidationStub.resetHistory();
  });

  it('should return an Express Router', () => {
    accountantRouter.should.have.property('stack');
    accountantRouter.stack.should.be.an('array');
    chai.expect(accountantRouter).to.be.a('function');
  });

  it('should register 7 routes (5 CRUD from routeFactory + GET /types + GET /monthly-balance)', () => {
    accountantRouter.stack.should.have.lengthOf(7);
  });

  it('should register GET /types for getTransactionTypes with auth middleware', () => {
    const typesRoute = accountantRouter.stack.find(
      (layer: any) => layer.route?.path === '/types' && layer.route?.methods?.get,
    );
    chai.expect(typesRoute).to.exist;
    typesRoute.route.stack.should.have.lengthOf(2);
  });

  it('should register GET /monthly-balance for listMonthlyBalances with auth middleware', () => {
    const balanceRoute = accountantRouter.stack.find(
      (layer: any) => layer.route?.path === '/monthly-balance' && layer.route?.methods?.get,
    );
    chai.expect(balanceRoute).to.exist;
    balanceRoute.route.stack.should.have.lengthOf(2);
  });

  it('should register standard CRUD routes', () => {
    const hasListRoute = accountantRouter.stack.some(
      (layer: any) => layer.route?.path === '/' && layer.route?.methods?.get,
    );
    const hasCreateRoute = accountantRouter.stack.some(
      (layer: any) => layer.route?.path === '/' && layer.route?.methods?.post,
    );
    const hasGetByIdRoute = accountantRouter.stack.some(
      (layer: any) => layer.route?.path === idPattern && layer.route?.methods?.get,
    );
    const hasUpdateRoute = accountantRouter.stack.some(
      (layer: any) => layer.route?.path === idPattern && layer.route?.methods?.put,
    );
    const hasDeleteRoute = accountantRouter.stack.some(
      (layer: any) => layer.route?.path === idPattern && layer.route?.methods?.delete,
    );

    hasListRoute.should.be.true;
    hasCreateRoute.should.be.true;
    hasGetByIdRoute.should.be.true;
    hasUpdateRoute.should.be.true;
    hasDeleteRoute.should.be.true;
  });
});
