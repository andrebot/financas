const Controller = require('./controller');
const establishmentModel = require('../domain/establishment.model');
const establishmentController = Controller(establishmentModel);

const controller = {};

module.exports = Object.assign(controller, establishmentController);
