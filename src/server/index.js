const express = require('express');
const serverConfig = require('../config/server');
const database = require('./database');

const app = express();

database.connectToDb(function () {
  app.listen(serverConfig.PORT, function () {
    console.log(`Listening on ${serverConfig.PORT}...`);
  });
});
