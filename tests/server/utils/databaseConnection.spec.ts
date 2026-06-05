import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';

chai.use(sinonChai);
chai.should();

describe('Database Connection', function() {
  let loggerInfoStub: SinonStub;
  let loggerErrorStub: SinonStub;
  let poolEndStub: SinonStub;
  let PoolConstructorStub: SinonStub;
  let drizzleStub: SinonStub;
  let database: typeof import('../../../src/server/utils/databaseConnection').default;

  beforeEach(() => {
    loggerInfoStub = sinon.stub();
    loggerErrorStub = sinon.stub();
    poolEndStub = sinon.stub().resolves();

    PoolConstructorStub = sinon.stub().returns({ end: poolEndStub });
    drizzleStub = sinon.stub().returns({});

    database = proxyquire('../../../src/server/utils/databaseConnection', {
      'drizzle-orm/node-postgres': { drizzle: drizzleStub },
      'pg': { Pool: PoolConstructorStub },
      './logger': {
        createLogger: sinon.stub().returns({
          info: loggerInfoStub,
          error: loggerErrorStub,
        }),
      },
      '../config/drizzle': { DB_URL: 'postgres://test' },
    }).default;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('connectToDatabase', function() {
    it('should connect to database successfully', function() {
      database.connectToDatabase();

      PoolConstructorStub.should.have.been.calledOnce;
      drizzleStub.should.have.been.calledOnce;
      loggerInfoStub.should.have.been.calledWith('Connected to database');
    });

    it('should handle connection error', function() {
      PoolConstructorStub.throws(new Error('Connection failed'));

      database.connectToDatabase();

      loggerErrorStub.should.have.been.calledOnce;
    });
  });

  describe('disconnectFromDatabase', function() {
    it('should disconnect from database successfully', async function() {
      database.connectToDatabase();
      await database.disconnectFromDatabase();

      poolEndStub.should.have.been.calledOnce;
      loggerInfoStub.should.have.been.calledWith('Disconnected from database');
    });

    it('should handle disconnection error', async function() {
      database.connectToDatabase();
      poolEndStub.rejects(new Error('Disconnection failed'));

      await database.disconnectFromDatabase();

      loggerErrorStub.should.have.been.calledOnce;
    });
  });
});
