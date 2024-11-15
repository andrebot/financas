import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import sinonChai from 'sinon-chai';
import mongoose from 'mongoose';
import database from '../../../src/server/utils/databaseConnection';
import logger from '../../../src/server/utils/logger';

// This is the first test file that needs to be run, so we need to initialize chai here. setup is not working
chai.use(sinonChai);
chai.should();

describe('Database Connection', function() {
  let connectStub: SinonStub;
  let disconnectStub: SinonStub;
  let loggerInfoStub: SinonStub;
  let loggerErrorStub: SinonStub;

  beforeEach(() => {
    connectStub = sinon.stub(mongoose, 'connect').resolves();
    disconnectStub = sinon.stub(mongoose, 'disconnect').resolves();
    loggerInfoStub = sinon.stub(logger, 'info');
    loggerErrorStub = sinon.stub(logger, 'error');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('connectToDatabase', function() {
    it('should connect to database successfully', async function() {
      await database.connectToDatabase();
      connectStub.should.have.been.calledOnce;
      loggerInfoStub.should.have.been.calledWith('Connected to database');
    });

    it('should handle connection error', async function() {
      connectStub.rejects(new Error('Connection failed'));
      await database.connectToDatabase();
      loggerErrorStub.should.have.been.calledOnce;
    });
  });

  describe('disconnectFromDatabase', function() {
    it('should disconnect from database successfully', async function() {
      await database.disconnectFromDatabase();
      disconnectStub.should.have.been.calledOnce;
      loggerInfoStub.should.have.been.calledWith('Disconnected from database');
    });

    it('should handle disconnection error', async function() {
      disconnectStub.rejects(new Error('Disconnection failed'));
      await database.disconnectFromDatabase();
      loggerErrorStub.should.have.been.calledOnce;
    });
  });
});
