const Controller = require('./controller');
const costCenterModel = require('../domain/costCenter.model');
const costCenterController = Controller(costCenterModel);

const controller = {};

module.exports = Object.assign(controller, costCenterController);
