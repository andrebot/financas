const exportConfig = require('export-config');

const Logger = {
  default: {
    LOG_LEVEL: 'info'
  },
  test: {
    LOG_LEVEL: 'silent'
  }
}

module.exports = exportConfig(Logger);
