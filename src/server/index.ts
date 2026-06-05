import app from './server';
import { createLogger } from './utils/logger';
import db from './utils/databaseConnection';
import { PORT } from './config/server';

const BootstrapLogger = createLogger('ServerBootstrap');

// Start the server
const server = app.listen(PORT, async () => {
  BootstrapLogger.info(`Server listening on port ${PORT}...`);

  db.connectToDatabase();
});

/**
 * Gracefully disconnects the database, closes the HTTP server and exits the process.
 */
const dispose = async () => {
  await db.disconnectFromDatabase();
  await server.close();
  BootstrapLogger.info('Server closed');
  process.exit(0);
};

process.on('SIGINT', dispose);
process.on('SIGTERM', dispose);
