const Controller = require('./controller');
const billModel = require('../domain/bill.model');
const billController = Controller(billModel);

const controller = {
  listAll(request, response) {
    const { month, year } = request.query;

    if (month && year) {
      const date = new Date(year, month, 1);

      request.mongooseQuery = {
        'repeat.until': { $gte: date }
      };
    }

    billController.listAll(request, response);
  }
};

module.exports = Object.assign({}, billController, controller);
