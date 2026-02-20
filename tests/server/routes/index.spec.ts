import sinon from 'sinon';
import { Express } from 'express';
import proxyquire from 'proxyquire';
import type { SinonStub } from 'sinon';
import { API_PREFIX } from '../../../src/server/config/server';

const loggerStub = {
  info: sinon.stub(),
  error: sinon.stub(),
};

const contentManagerStub = {
  categoryActions: {},
  accountActions: {},
  goalActions: {},
  budgetActions: {},
};

const commonControllerStub = sinon.stub().returns({});
const routeFactoryStub = sinon.stub().returns({});
const userRouteStub = {};
const transactionRouteStub = {};

const setRoutes = proxyquire('../../../src/server/routes/index', {
  '../utils/logger': {
    createLogger: sinon.stub().returns(loggerStub),
  },
  '../managers/contentManager': {
    default: contentManagerStub,
  },
  '../controllers/commonController': {
    default: commonControllerStub,
  },
  './routeFactory': {
    default: routeFactoryStub,
  },
  './authentication': {
    default: userRouteStub,
  },
  './transaction': {
    default: transactionRouteStub,
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

    loggerStub.info.resetHistory();
  });

  it('should register all 6 routes with correct paths', () => {
    setRoutes(appMock);

    appUseStub.should.have.been.called;
    appUseStub.should.have.callCount(6);

    const paths = appUseStub.getCalls().map((call) => call.args[0]);
    paths.should.include(`${API_PREFIX}/user`);
    paths.should.include(`${API_PREFIX}/transaction`);
    paths.should.include(`${API_PREFIX}/category`);
    paths.should.include(`${API_PREFIX}/account`);
    paths.should.include(`${API_PREFIX}/goal`);
    paths.should.include(`${API_PREFIX}/budget`);
  });

  it('should pass router to app.use for each route', () => {
    setRoutes(appMock);

    appUseStub.getCalls().forEach((call) => {
      call.args.should.have.lengthOf(2);
      call.args[0].should.be.a('string');
      call.args[1].should.be.an('object');
    });
  });

  it('should log each route when added', () => {
    setRoutes(appMock);

    loggerStub.info.should.have.callCount(6);
    loggerStub.info.should.have.been.calledWith(`Route added: ${API_PREFIX}/user`);
    loggerStub.info.should.have.been.calledWith(`Route added: ${API_PREFIX}/transaction`);
    loggerStub.info.should.have.been.calledWith(`Route added: ${API_PREFIX}/category`);
    loggerStub.info.should.have.been.calledWith(`Route added: ${API_PREFIX}/account`);
    loggerStub.info.should.have.been.calledWith(`Route added: ${API_PREFIX}/goal`);
    loggerStub.info.should.have.been.calledWith(`Route added: ${API_PREFIX}/budget`);
  });
});
