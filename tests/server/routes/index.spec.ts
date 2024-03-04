import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import { Express } from 'express';
import setRoutes from '../../../src/server/routes';
import logger from '../../../src/server/utils/logger';
import fs from 'fs';

chai.should();

describe('setRoutes', () => {
  let readdirSyncStub: SinonStub;
  let loggerStub: {
    info: SinonStub;
    error: SinonStub;
  };
  let appUseStub: SinonStub;
  let appMock: Express;

  beforeEach(() => {
    readdirSyncStub = sinon.stub(fs, 'readdirSync');
    loggerStub = sinon.stub(logger);
    appUseStub = sinon.stub();

    appMock = {
      use: appUseStub,
    } as unknown as Express;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should log file imports', () => {
    readdirSyncStub.returns(['mockroute.ts', 'index.ts', 'someOtherFile.txt']);
    
    const mockRoutePath = require.resolve('./mockroute'); 
    const mockRoute = require(mockRoutePath).default;

    setRoutes(appMock, __dirname);

    loggerStub.info.should.have.been.calledWithMatch(/Importing file:/);
    appUseStub.should.have.been.calledOnce; // there is only one valid file in the returned files
    appUseStub.should.have.been.calledWith(`/api/v1/${mockRoute.urlPrefix}`, mockRoute.router);
  });

  it('should handle an error when reading directory', () => {
    readdirSyncStub.throws(new Error('Read directory error'));

    setRoutes(appMock);

    loggerStub.error.should.have.been.calledWith('Error reading directory:', sinon.match.any);
  });

  it('should ignore any file that is not ts', () => {
    readdirSyncStub.returns(['someOtherFile.txt']);

    setRoutes(appMock);

    loggerStub.info.should.have.been.calledWithMatch('skipping file someOtherFile.txt to be added as a route');
  });

  it('should ignore index.ts', () => {
    readdirSyncStub.returns(['index.ts']);

    setRoutes(appMock);

    loggerStub.info.should.have.been.calledWithMatch('skipping file index.ts to be added as a route');
  });

  it('should register routes correctly', () => {
    // Mock a route file in the directory
    readdirSyncStub.returns(['mockroute.ts']);
    
    // Assuming the mock route is in the same directory as the test file
    const mockRoutePath = require.resolve('./mockroute'); 
    const mockRoute = require(mockRoutePath).default;

    setRoutes(appMock, __dirname);

    // Check if app.use has been called with the correct arguments
    appUseStub.should.have.been.calledWith(`/api/v1/${mockRoute.urlPrefix}`, mockRoute.router);
  });

  it('should handle invalid route configuration', () => {
    // Mock a route file in the directory
    readdirSyncStub.returns(['invalidRoute.ts']);
    
    // Assuming the mock route is in the same directory as the test file
    const invalidRoutePath = require.resolve('./invalidRoute'); 
    const invalidRoute = require(invalidRoutePath).default;

    setRoutes(appMock, __dirname);

    // Check if app.use has been called with the correct arguments
    appUseStub.should.not.have.been.calledWith(`/api/v1/${invalidRoute.urlPrefix}`, invalidRoute.router);
    loggerStub.error.should.have.been.calledWithMatch('file invalidRoute.ts does not have a valid route configuration. Skipping...');
  });
});
