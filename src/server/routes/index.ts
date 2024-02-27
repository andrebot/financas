import { Express } from 'express';
import { readdirSync } from 'fs';
import path from 'path';

import logger from '../utils/logger';

/**
 * This method will read all files at the route folder
 * and add them to the application route.
 *
 * @param app the Express application
 * @param basePath the base path to find all routes
 */
export default function setRoutes(app: Express, basePath = __dirname): void {
  try {
    const files = readdirSync(basePath);

    files.forEach((file) => {
      if (file === 'index.ts' || !file.endsWith('.ts')) {
        logger.info(`skipping file ${file} to be added as a route`);
        return;
      }

      const filePath = path.resolve(basePath, file);
      logger.info(`Importing file: ${filePath}`);

      // eslint-disable-next-line
      const { urlPrefix, router } = require(filePath).default;

      app.use(`/api/v1/${urlPrefix}`, router);
      logger.info(`Route added: /api/v1/${urlPrefix}`);
    });
  } catch (error) {
    logger.error('Error reading directory:', error);
  }
}
