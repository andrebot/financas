const Controller = require('./controller');
const userModel = require('../domain/user.model');
const userController = Controller(userModel);

const controller = {};

module.exports = Object.assign(controller, userController);
