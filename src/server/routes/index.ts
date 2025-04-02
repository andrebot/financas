import { Express } from 'express';
import { readdirSync } from 'fs';
import path from 'path';
import { API_PREFIX } from '../config/server';
import { createLogger } from '../utils/logger';

const logger = createLogger('RoutesInitializer');

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

      if (urlPrefix && router) {
        app.use(`${API_PREFIX}/${urlPrefix}`, router);
        logger.info(`Route added: ${API_PREFIX}/${urlPrefix}`);
      } else {
        logger.error(`file ${file} does not have a valid route configuration. Skipping...`);
      }
    });
  } catch (error) {
    logger.error('Error reading directory:', error);
  }
}
