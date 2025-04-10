import { Express } from 'express';
import proxyquire from 'proxyquire';
import sinon, { SinonStub } from 'sinon';
import { API_PREFIX } from '../../../src/server/config/server';

const loggerStub = {
  info: sinon.stub(),
  error: sinon.stub(),
};

const standardRouteFactoryStub = sinon.stub().returns(
  { prefix: 'account', controller: {
    listContent: sinon.stub(),  
    createContent: sinon.stub(),
    getContent: sinon.stub(),
    updateContent: sinon.stub(),
    deleteContent: sinon.stub(),
  } }
);

const contentRouteFactoryStub = sinon.stub().returns({});
const userRouteStub = sinon.stub().returns({});
const transactionRouteStub = sinon.stub().returns({});

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
    contentRouteFactoryStub.should.have.been.called;
    appUseStub.should.have.been.calledWith(`${API_PREFIX}/account`, {});
    appUseStub.should.have.been.calledWith(`${API_PREFIX}/user`, userRouteStub);
    appUseStub.should.have.been.calledWith(`${API_PREFIX}/transaction`, transactionRouteStub);
  });
});
