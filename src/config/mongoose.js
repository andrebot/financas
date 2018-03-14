const exportConfig = require('export-config');

const MongooseConfig = {
  default: {
    URL: 'mongodb://localhost/financas'
  }
};

module.exports = exportConfig(MongooseConfig);
