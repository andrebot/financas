const exportConfig = require('export-config');

const ServerConfig = {
  default: {
    PORT: 3000
  }
};

module.exports = exportConfig(ServerConfig);
