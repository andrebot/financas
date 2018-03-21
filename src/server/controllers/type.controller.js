const Controller = require('./controller');
const typeModel = require('../domain/type.model');
const typeController = Controller(typeModel);

const controller = {};

module.exports = Object.assign(controller, typeController);
