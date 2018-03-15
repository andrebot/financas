const exportConfig = require('export-config');

const Logger = {
  default: {
    LOGE_LEVEL: 'info'
  }
}

module.exports = exportConfig(Logger);
