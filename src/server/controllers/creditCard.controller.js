const Controller = require('./controller');
const creditCardModel = require('../domain/creditCard.model');
const creditCardController = Controller(creditCardModel);

const controller = {};

module.exports = Object.assign(controller, creditCardController);
