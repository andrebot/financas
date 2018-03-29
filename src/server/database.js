const mongoose = require('mongoose');
const Logger = require('./helpers/logger');
const mongoConfig = require('../config/mongoose');

mongoose.Promise = Promise;

function closeConnection() {
  mongoose.connection.close(() => {
    Logger.info('closing connctions to database');
    process.exit(0);
  });
}

function configEvents(callback) {
  mongoose.connection.on('error', function (error) {
    Logger.warn('Could no connect to mongo...');
    Logger.error(error);
  }).on('disconnected', function (error) {
    Logger.warn('Mongo disconnected.');

    if (error) {
      Logger.error(error);
    }
  }).on('connected', function () {
    callback();
  });

  process.on('SIGINT', closeConnection).on('SIGTERM', closeConnection);
}

function connectToDb(callback) {
  configEvents(callback);

  mongoose.connect(mongoConfig.URL);
}

module.exports = {
  connectToDb
};
