import { createLogger } from './logger';

const logger = createLogger('NotificationUtils');

/**
 * Send a notification to a user
 *
 * @param userEmail - The user email
 * @param message - The message to send
 * @returns Whether the notification was sent or not
 */
export default function sendNotification(userEmail: string, message: string): boolean {
  logger.info(`Sending notification to ${userEmail}: ${message}`);

  return true;
}
