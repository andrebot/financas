import winston from 'winston';

const {
  combine,
  timestamp,
  printf,
  colorize,
} = winston.format;

/**
 * Custom logging function. mimics the console.log behavior
 */
const logFormat = printf(({
  level,
  message,
  timestamp: tmstp,
  stack,
}) => {
  const formattedMessage = `${tmstp} [${level}]: ${typeof message === 'object' ? JSON.stringify(message, null, 2) : message}`;
  return stack && level.includes('error')
    ? `${formattedMessage}\n${stack}`
    : `${formattedMessage}`;
});

// Define the logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: combine(
    colorize(),
    timestamp(),
    logFormat,
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

// Export the logger
export default logger;
