import chai from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

const accessTokenValidationStub = sinon.stub().callsFake(() => (_req: any, _res: any, next: any) => next());

const mockController = {
  listContent: sinon.stub(),
  createContent: sinon.stub(),
  getContent: sinon.stub(),
  updateContent: sinon.stub(),
  deleteContent: sinon.stub(),
};

const routeFactory = proxyquire('../../../src/server/routes/routeFactory', {
  '../utils/authorization': {
    default: accessTokenValidationStub,
  },
}).default;

describe('routeFactory', () => {
  const idPattern = '/:id([0-9a-fA-F]{24})';

  beforeEach(() => {
    accessTokenValidationStub.resetHistory();
  });

  it('should return an Express Router', () => {
    const router = routeFactory(mockController as any);

    router.should.have.property('stack');
    router.stack.should.be.an('array');
    chai.expect(router).to.be.a('function');
  });

  it('should register 5 routes', () => {
    const router = routeFactory(mockController as any);

    router.stack.should.have.lengthOf(5);
  });

  it('should register GET / for listContent', () => {
    const router = routeFactory(mockController as any);

    const listRoute = router.stack.find(
      (layer: any) => layer.route?.path === '/' && layer.route?.methods?.get,
    );
    chai.expect(listRoute).to.exist;
    listRoute.route.stack.should.have.lengthOf(2);
  });

  it('should register POST / for createContent', () => {
    const router = routeFactory(mockController as any);

    const createRoute = router.stack.find(
      (layer: any) => layer.route?.path === '/' && layer.route?.methods?.post,
    );
    chai.expect(createRoute).to.exist;
  });

  it('should register GET /:id for getContent', () => {
    const router = routeFactory(mockController as any);

    const getRoute = router.stack.find(
      (layer: any) => layer.route?.path === idPattern && layer.route?.methods?.get,
    );
    chai.expect(getRoute).to.exist;
  });

  it('should register PUT /:id for updateContent', () => {
    const router = routeFactory(mockController as any);

    const updateRoute = router.stack.find(
      (layer: any) => layer.route?.path === idPattern && layer.route?.methods?.put,
    );
    chai.expect(updateRoute).to.exist;
  });

  it('should register DELETE /:id for deleteContent', () => {
    const router = routeFactory(mockController as any);

    const deleteRoute = router.stack.find(
      (layer: any) => layer.route?.path === idPattern && layer.route?.methods?.delete,
    );
    chai.expect(deleteRoute).to.exist;
  });

  it('should use access token validation middleware on all routes', () => {
    routeFactory(mockController as any);

    accessTokenValidationStub.should.have.callCount(5);
  });
});
