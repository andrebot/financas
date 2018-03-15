const exportConfig = require('export-config');

const MongooseConfig = {
  default: {
    URL: 'mongodb://localhost/financas',
    modelConfig: {
      HASH_ROUNDS: 10
    }
  }
};

module.exports = exportConfig(MongooseConfig);
