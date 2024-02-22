import logger from './logger';

export default function sendNotification(userEmail: string, message: string): boolean {
  logger.info(`Sending notification to ${userEmail}: ${message}`);

  return true;
}
