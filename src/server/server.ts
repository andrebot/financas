import express, { Request, Response } from 'express';
import helmet from 'helmet';
import path from 'path';
import cors from 'cors';
import * as dotenv from 'dotenv';
import logger from './utils/logger';
import config from './config/server';
import setRoutes from './routes';

dotenv.config();

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

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.use((err: Error, req: Request, res: Response) => {
  logger.error(err);
  res.status(500).send(err.message);
});

export default app;