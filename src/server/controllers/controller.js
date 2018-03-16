const Logger = require('../helpers/logger');

function Factory(model) {
  const modelName = model.collection.name;

  return {
    listAll: listAll(model, modelName),
    create: create(model, modelName)
  }
}

/**
 * Creates a function to handle all DB errors
 * 
 * @param {ExpressResponse} response 
 * @param {String} modelName 
 * @param {String} message 
 * @returns error handler for DB error
 */
function handleErrorFromDB(response, modelName, message) {
  return function (dbError) {
    const errors =  dbError.errors;

    Logger.error(`${modelName}: ${message}`);
    Logger.error(dbError);

    if (errors && errors.constructor === Array && errors.length > 0) {
      errors.forEach(function (error) {
        Logger.error(error);
      });
    }

    response.status(500).send(message);
  }
}

/**
 * Creates a controller function which saves the payload as a new model
 * 
 * @param {MongooseModel} model 
 * @param {String} modelName 
 */
function create(model, modelName) {
  return function (request, response) {
    const newModel = new model(request.body);
    newModel.save().then(function (savedModel) {
      Logger.info(`${modelName}: Model saved successfully. #${savedModel._id}`);

      response.json({ data: savedModel });
    }).catch(handleErrorFromDB(response, modelName, 'There was an error saving this model'));
  }
}

/**
 * Create a controller function which lists all documents from a collection.
 * 
 * @param {MongooseModel} model 
 * @returns controller to handle a get call to list all documents
 */
function listAll(model, modelName) {
  return function (request, response) {
    model.find({}).then(function(documents) {
      const numberOfDocuments = documents.length;
      const result = {
        data: []
      };

      if (documents && documents.length > 0) {
        Logger.info(`${modelName}: Returning ${numberOfDocuments} documents`);

        result.data = documents;
      } else {
        Logger.info(`${modelName}: no documents were found`);
      }

      response.json(result);
    }).catch(handleErrorFromDB(response, modelName, 'There was an error fetching all documents for this model'))
  }
}

module.exports = Factory;
