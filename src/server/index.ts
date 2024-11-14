import app from './server';
import logger from './utils/logger';
import db from './utils/databaseConnection';
import { PORT } from './config/server';

// Start the server
const server = app.listen(PORT, async () => {
  logger.info(`Server listening on port ${PORT}...`);

  await db.connectToDatabase();
});

// Cleanly disposing and closing the server
const dispose = async () => {
  await db.disconnectFromDatabase();
  await server.close();
  process.exit(0);
};

process.on('SIGINT', dispose);
process.on('SIGTERM', dispose);
