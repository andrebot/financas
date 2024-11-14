import mongoose from 'mongoose';
import logger from './logger';
import { DB_URL, MONGO_OPT } from '../config/mongo';

/**
 * Connects to a MongoDB database
 *
 * @returns A promise that resolves when the connection is successful
 */
async function connectToDatabase(): Promise<void> {
  try {
    logger.info(`Connecting to mongo: ${DB_URL}`);
    await mongoose.connect(DB_URL, MONGO_OPT);

    logger.info('Connected to database');
  } catch (error) {
    logger.error(error);
  }
}

/**
 * Disconnects from the MongoDB database
 *
 * @returns A promise that resolves when the disconnection is successful
 */
async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();

    logger.info('Disconnected from database');
  } catch (error) {
    logger.error(error);
  }
}
export default { connectToDatabase, disconnectFromDatabase };
