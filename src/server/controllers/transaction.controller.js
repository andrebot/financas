const Controller = require('./controller');
const transactionModel = require('../domain/transaction.model');
const transactionController = Controller(transactionModel);

const controller = {
  listAll(request, response) {
    let { month, year } = request.query;

    try {
      month = parseInt(month);
      year = parseInt(year);

      if (month && year) {
        const date = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        request.mongooseQuery = {
          date: { $gte: date, $lte: endDate }
        };
      }

      transactionController.listAll(request, response);
    } catch (error) {
      Logger.error('TransactionController: There was an error while parsing the query parameters.');
      Logger.error(error);

      response.status(400).send(`Error while validating the query parameters. ${error.message}`);
    }
  }
};

module.exports = Object.assign({}, transactionController, controller);
