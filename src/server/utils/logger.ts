import winston from 'winston';
import util from 'util';

const {
  combine,
  timestamp,
  printf,
  colorize,
} = winston.format;
/**
 * Safely converts any log message to a string.
 * - Errors: prefer stack, then message
 * - Objects: try JSON, fall back to util.inspect for circular structures
 * - Primitives: cast to string
 * 
 * @param message - The message to format
 * @returns The formatted message
 */
function formatMessageSafely(message: unknown): string {
  if (message instanceof Error) {
    return message.stack || message.message;
  }

  if (typeof message === 'object' && message !== null) {
    try {
      return JSON.stringify(message, null, 2);
    } catch {
      // Handles circular references (e.g. Socket, req/res objects)
      return util.inspect(message, { depth: 3, colors: false });
    }
  }

  if (typeof message === 'undefined') {
    return '';
  }

  return String(message);
}

/**
 * Custom logging function. mimics the console.log behavior
 */
const logFormat = printf(({
  level,
  message,
  timestamp: tmstp,
  stack,
  label,
}) => {
  const prefix = label ? `[${label}]` : ' ';
  const formattedMessage = `${tmstp} ${prefix}[${level}]: ${formatMessageSafely(message)}`;
  return stack && level.includes('error')
    ? `${formattedMessage}\n${stack}`
    : `${formattedMessage}`;
});

// Define the logger configuration
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
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

export function createLogger(label: string) {
  return logger.child({ label });
}
