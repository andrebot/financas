const express      = require('express');
const bodyParser   = require('body-parser');
const Logger       = require('./helpers/logger');
const serverConfig = require('../config/server');
const database     = require('./database');
const bankRoute    = require('./routes/bank.route');
const billRoute    = require('./routes/bill.route');

const app = express();

// =======================
// = Adding static files =
// =======================
app.use(express.static('public'));

// ======================
// = Adding middlewares =
// ======================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// =============================
// = Adding routes for the API =
// =============================
app.use('/api/v1/bank', bankRoute);
app.use('/api/v1/bill', billRoute);

// ===============================================
// = Connecting to Database and deploying server =
// ===============================================
database.connectToDb(function () {
  app.listen(serverConfig.PORT, function () {
    Logger.info(`Listening on ${serverConfig.PORT}...`);
  });
});
