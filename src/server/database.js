const mongoose = require('mongoose');
const mongoConfig = require('../config/mongoose');

mongoose.Promise = Promise;

function closeConnection() {
  mongoose.connection.close(() => {
    console.log('closing connctions to database');
    process.exit(0);
  });
}

function configEvents(callback) {
  mongoose.connection.on('error', function (error) {
    console.log('Could no connect to mongo...');
    console.error(error);
  }).on('disconnected', function (error) {
    console.log('Mongo disconnected.');

    if (error) {
      console.error(error);
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
