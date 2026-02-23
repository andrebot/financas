import { Express, Router } from 'express';
import { API_PREFIX } from '../config/server';
import { createLogger } from '../utils/logger';
import transactionRouter from './transaction';
import userRouter from './authentication';
import CommonController from '../controllers/commonController';
import ContentManager from '../managers/contentManager';
import type {
  IAccount, IBudget, IGoal,
  ICategory,
} from '../types';
import routeFactory from './routeFactory';

const logger = createLogger('RoutesInitializer');

/**
 * Main routes mapping
 */
const routes: { prefix: string; router: Router }[] = [
  {
    prefix: 'user',
    router: userRouter,
  },
  {
    prefix: 'transaction',
    router: transactionRouter,
  },
  {
    prefix: 'category',
    router: routeFactory<ICategory>(CommonController(ContentManager.categoryActions, 'Category')),
  },
  {
    prefix: 'account',
    router: routeFactory<IAccount>(CommonController(ContentManager.accountActions, 'Account')),
  },
  {
    prefix: 'goal',
    router: routeFactory<IGoal>(CommonController(ContentManager.goalActions, 'Goal')),
  },
  {
    prefix: 'budget',
    router: routeFactory<IBudget>(CommonController(ContentManager.budgetActions, 'Budget')),
  },
];

/**
 * Sets the routes for the express app
 *
 * @param app - The express app
 */
export default function setRoutes(app: Express) {
  routes.forEach(({ prefix, router }) => {
    app.use(`${API_PREFIX}/${prefix}`, router);
    logger.info(`Route added: ${API_PREFIX}/${prefix}`);
  });
}
