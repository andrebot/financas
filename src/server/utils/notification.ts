import logger from './logger';

export function sendNotification(userEmail: string, message: string): boolean	{
  logger.info(`Sending notification to ${userEmail}: ${message}`);

  return true;
}
