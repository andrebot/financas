const winston = require('winston');
const loggerConfig = require('../../config/logger');

winston.emitErrs = true;

module.exports = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: loggerConfig.LOG_LEVEL,
      handleExceptions: true,
      json: false,
      colorize: true,
      humanReadableUnhandledException: true,
      timestamp: function() {
        return (new Date()).toISOString();
      }
    })
  ],
  exitOnError: false
});
