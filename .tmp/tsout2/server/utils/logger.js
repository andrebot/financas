"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMessageSafely = formatMessageSafely;
exports.createLogger = createLogger;
var winston_1 = __importDefault(require("winston"));
var util_1 = __importDefault(require("util"));
var _a = winston_1.default.format, combine = _a.combine, timestamp = _a.timestamp, printf = _a.printf, colorize = _a.colorize;
/**
 * Safely converts any log message to a string.
 * - Errors: prefer stack, then message
 * - Objects: try JSON, fall back to util.inspect for circular structures
 * - Primitives: cast to string
 *
 * @param message - The message to format
 * @returns The formatted message
 */
function formatMessageSafely(message) {
    if (message instanceof Error) {
        return message.stack || message.message;
    }
    if (typeof message === 'object' && message !== null) {
        try {
            return JSON.stringify(message, null, 2);
        }
        catch (_a) {
            // Handles circular references (e.g. Socket, req/res objects)
            return util_1.default.inspect(message, { depth: 3, colors: false });
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
var logFormat = printf(function (_a) {
    var level = _a.level, message = _a.message, tmstp = _a.timestamp, stack = _a.stack, label = _a.label;
    var prefix = label ? "[".concat(label, "]") : ' ';
    var formattedMessage = "".concat(tmstp, " ").concat(prefix, "[").concat(level, "]: ").concat(formatMessageSafely(message));
    return stack && level.includes('error')
        ? "".concat(formattedMessage, "\n").concat(stack)
        : "".concat(formattedMessage);
});
// Define the logger configuration
var logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
    format: combine(colorize(), timestamp(), logFormat),
    transports: [
        new winston_1.default.transports.Console(),
    ],
});
// Export the logger
exports.default = logger;
function createLogger(label) {
    return logger.child({ label: label });
}
