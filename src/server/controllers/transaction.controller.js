const Controller = require('./controller');
const transactionModel = require('../domain/transaction.model');
const transactionController = Controller(transactionModel);

const controller = {};

module.exports = Object.assign(controller, transactionController);
