import app from './server';
import { createLogger } from './utils/logger';
import db from './utils/databaseConnection';
import { PORT } from './config/server';

const BootstrapLogger = createLogger('ServerBootstrap');

// Start the server
const server = app.listen(PORT, async () => {
  BootstrapLogger.info(`Server listening on port ${PORT}...`);

  await db.connectToDatabase();
});

// Cleanly disposing and closing the server
const dispose = async () => {
  await db.disconnectFromDatabase();
  await server.close();
  BootstrapLogger.info('Server closed');
  process.exit(0);
};

process.on('SIGINT', dispose);
process.on('SIGTERM', dispose);
