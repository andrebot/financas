const Controller = require('./controller');
const billModel = require('../domain/bill.model');
const billController = Controller(billModel);

const controller = {};

module.exports = Object.assign(controller, billController);
