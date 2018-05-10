const Controller = require('./controller');
const billModel = require('../domain/bill.model');
const Logger = require('../helpers/logger');
const billController = Controller(billModel);

const controller = {
  listAll(request, response) {
    let { month, year } = request.query;

    try {
      month = parseInt(month);
      year = parseInt(year);

      if ((month || month === 0) && year) {
        const date = new Date(year, month, 1);

        request.mongooseQuery = {
          'repeat.until': { $gte: date }
        };
      }

      billController.listAll(request, response);
    } catch (error) {
      Logger.error('BillController: There was an error while parsing the query parameters.');
      Logger.error(error);

      response.status(400).send(`Error while validating the query parameters. ${error.message}`);
    }
  }
};

module.exports = Object.assign({}, billController, controller);
