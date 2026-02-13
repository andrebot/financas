import { Express } from 'express';
import proxyquire from 'proxyquire';
import sinon, { SinonStub } from 'sinon';
import { API_PREFIX } from '../../../src/server/config/server';

const loggerStub = {
  info: sinon.stub(),
  error: sinon.stub(),
};

const controllerStub = {
  listContent: sinon.stub(),
  createContent: sinon.stub(),
  getContent: sinon.stub(),
  updateContent: sinon.stub(),
  deleteContent: sinon.stub(),
};

const standardRouteFactoryStub = sinon.stub()
  .onFirstCall().returns({ prefix: 'account', controller: controllerStub })
  .onSecondCall().returns({ prefix: 'goal', controller: controllerStub })
  .onThirdCall().returns({ prefix: 'budget', controller: controllerStub });

const contentRouteFactoryStub = sinon.stub().returns({});
const userRouteStub = sinon.stub().returns({});
const transactionRouteStub = sinon.stub().returns({});
const categoryRouteStub = sinon.stub().returns({});

const setRoutes = proxyquire('../../../src/server/routes/index', {
  '../utils/logger': {
    createLogger: sinon.stub().returns(loggerStub),
  },
  './contentRouteFactory': {
    standardRouteFactory: standardRouteFactoryStub,
    default: contentRouteFactoryStub,
  },
  './authentication': {
    default: userRouteStub,
  },
  './transaction': {
    default: transactionRouteStub,
  },
  './category': {
    default: categoryRouteStub,
  },
}).default;

describe('setRoutes', () => {
  let appUseStub: SinonStub;
  let appMock: Express;

  beforeEach(() => {
    appUseStub = sinon.stub();


    appMock = {
      use: appUseStub,
    } as unknown as Express;

    sinon.resetHistory();
  });

  it('should instantiate the routes correctly', () => {
    setRoutes(appMock);

    appUseStub.should.have.been.called;
    appUseStub.should.have.callCount(6);
    contentRouteFactoryStub.should.have.been.calledThrice;

    appUseStub.should.have.been.calledWith(`${API_PREFIX}/account`, {});
    appUseStub.should.have.been.calledWith(`${API_PREFIX}/goal`, {});
    appUseStub.should.have.been.calledWith(`${API_PREFIX}/budget`, {});
    appUseStub.should.have.been.calledWith(`${API_PREFIX}/user`, userRouteStub);
    appUseStub.should.have.been.calledWith(`${API_PREFIX}/transaction`, transactionRouteStub);
    appUseStub.should.have.been.calledWith(`${API_PREFIX}/category`, categoryRouteStub);
  });

  it('should log each route when added', () => {
    setRoutes(appMock);

    loggerStub.info.should.have.callCount(6);
    loggerStub.info.should.have.been.calledWith(`Route added: ${API_PREFIX}/account`);
    loggerStub.info.should.have.been.calledWith(`Route added: ${API_PREFIX}/goal`);
    loggerStub.info.should.have.been.calledWith(`Route added: ${API_PREFIX}/budget`);
    loggerStub.info.should.have.been.calledWith(`Route added: ${API_PREFIX}/user`);
    loggerStub.info.should.have.been.calledWith(`Route added: ${API_PREFIX}/transaction`);
    loggerStub.info.should.have.been.calledWith(`Route added: ${API_PREFIX}/category`);
  });
});
