const Logger = require('../helpers/logger');

function Factory(model) {
  const modelName = model.collection.name;

  return {
    listAll: listAll(model, modelName),
    getById: getById(model, modelName),
    create: create(model, modelName),
    update: update(model, modelName),
    remove: remove(mode, modelName)
  }
}

/**
 * Creates a function to handle all DB errors
 * 
 * @param {ExpressResponse} response express response object
 * @param {String} modelName Model's name
 * @param {String} message Message to be printed in the log and sent to client
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
 * @param {MongooseModel} model Mongoose model to be used
 * @param {String} modelName model's name
 * @returns controller which creates a new document for the model provided
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
 * @param {MongooseModel} model Mongoose model to be used
 * @param {String} modelName model's name
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
    }).catch(handleErrorFromDB(response, modelName, 'There was an error fetching all documents for this model'));
  }
}

/**
 * Create a controller function which fetch a single document by ID.
 * 
 * @param {MongooseModel} mode Mongoose model to be used
 * @param {String} modelName model's name
 * @returns controller to handle a getById call to fetch a single document
 */
function getById(model, modelName) {
  return function (request, response) {
    const documentId = request.params.id;

    model.findById(documentId).then(function (document) {
      Logger.info(`${modelName}: Document #${documentId} was fetched`);

      response.json({ data: document });
    }).catch(handleErrorFromDB(response, modelName, `There was an error fetching document #${documentId}`));
  }
}

/**
 * Create a controller which update a document by its ID
 * 
 * @param {MongooseModel} model Mongoose model to be used
 * @param {String} modelName model's name
 * @returns controller to handle a update call to update a single document
 */
function update(model, modelName) {
  return function (request, response) {
    const documentId = request.params.id;

    model.findByIdAndUpdate(documentId, request.body).then(function (updatedDocument) {
      Logger.info(`${modelName}: Document #${documentId} updated successfully`);

      response.json({ data: updatedDocument });
    }).catch(handleErrorFromDB(response, modelName, `There was an error updating the document ${documentId}`));
  }
}

/**
 * Create a controller which delete a single document by ID
 * 
 * @param {MongooseModel} model Mongoose model to be used
 * @param {String} modelName model's name
 * @returns @returns controller to handle a delete call to remove a single document
 */
function remove(model, modelName) {
  return function (request, response) {
    const documentId = request.params.id;

    model.findOneAndRemove(documentId).then(function (deletedDocument) {
      const result = {
        data: {}
      };

      if (deletedDocument) {
        Logger.info(`${modelName}: Document #${documentId} was deleted successfully`);

        result.data = deletedDocument;
      } else {
        Logger.info(`${modelName}: No document was found with #${documentId}`);
      }

      response.json(result);
    }).catch(handleErrorFromDB(response, modelName, `There was an error trying to delete document #${documentId}`));
  }
}

module.exports = Factory;