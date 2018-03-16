const express      = require('express');
const bodyParser   = require('body-parser');
const Logger       = require('./helpers/logger');
const serverConfig = require('../config/server');
const database     = require('./database');

const app = express();

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

database.connectToDb(function () {
  app.listen(serverConfig.PORT, function () {
    Logger.info(`Listening on ${serverConfig.PORT}...`);
  });
});
