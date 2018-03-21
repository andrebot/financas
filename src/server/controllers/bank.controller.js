const Controller = require('./controller');
const bankModel = require('../domain/bank.model');
const bankController = Controller(bankModel);

const controller = {};

module.exports = Object.assign(controller, bankController);
