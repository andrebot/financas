import express, { Request, Response } from 'express';
import helmet from 'helmet';
import path from 'path';
import cors from 'cors';
import * as dotenv from 'dotenv';

// Process all env variables
dotenv.config();

/* eslint-disable import/first */
import logger from './utils/logger';
import db from './utils/databaseConnection';
import config from './config/server';
import setRoutes from './routes';
/* eslint-enable import/first */

const app = express();

app.use(cors({
  origin(origin, callback): void {
    const origins = [`http://localhost:${config.PORT}`, '*'];
    callback(null, origin || origins);
  },
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'OPTIONS', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use('/', express.static(path.resolve(__dirname, 'public')));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));

setRoutes(app);

// Catch-all route to handle all other requests and direct them to the SPA
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Handle errors
app.use((err: Error, req: Request, res: Response) => {
  logger.error(err);
  res.status(500).send(err.message);
});

// Start the server
const server = app.listen(config.PORT, async () => {
  logger.info(`Server listening on port ${config.PORT}...`);

  // await db.connectToDatabase();
});

// Cleanly disposing and closing the server
const dispose = async () => {
  await db.disconnectFromDatabase();
  await server.close();
  process.exit(0);
};

process.on('SIGINT', dispose);
process.on('SIGTERM', dispose);
