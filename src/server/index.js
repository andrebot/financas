const express            = require('express');
const bodyParser         = require('body-parser');
const Logger             = require('./helpers/logger');
const serverConfig       = require('../config/server');
const database           = require('./database');
const bankRoute          = require('./routes/bank.route');
const billRoute          = require('./routes/bill.route');
const typeRoute          = require('./routes/type.route');
const userRoute          = require('./routes/user.route');
const costCenterRoute    = require('./routes/costCenter.route');
const creditCardRoute    = require('./routes/creditCard.route');
const transactionRoute   = require('./routes/transaction.route');
const establishmentRoute = require('./routes/establishment.route');

const app = express();

// =======================
// = Adding static files =
// =======================
app.use(express.static(`${__dirname}/public`));

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
app.use('/api/v1/type', typeRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/costCenter', costCenterRoute);
app.use('/api/v1/creditCard', creditCardRoute);
app.use('/api/v1/transaction', transactionRoute);
app.use('/api/v1/establishment', establishmentRoute);
app.use('*', function(request, response) {
  response.sendStatus(404);
});

// ===============================================
// = Connecting to Database and deploying server =
// ===============================================
database.connectToDb(function () {
  app.listen(serverConfig.PORT, function () {
    Logger.info(`Listening on ${serverConfig.PORT}...`);
  });
});
