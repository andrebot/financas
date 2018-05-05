const Controller = require('./controller');
const billModel = require('../domain/bill.model');
const billController = Controller(billModel);

const controller = {
  listAll(request, response) {
    const { month, year } = request.query;
    const date = new Date(year, month, 1);

    request.mongooseQuery = { $or: [{
        'repeat.until.month': { $gte: month},
        'repeat.until.year': { $gte: year}
      }, {
        'repeat.untilDate': { $gte: date }
      }]
    };

    billController.listAll(request, response);
  }
};

module.exports = Object.assign({}, billController, controller);
