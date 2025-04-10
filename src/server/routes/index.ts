import { Express, Router } from 'express';
import { API_PREFIX } from '../config/server';
import { createLogger } from '../utils/logger';
import BudgetManager from '../managers/budgetManager';
import transactionRouter from './transaction';
import contentRouterFactory, { standardRouteFactory } from './contentRouteFactory';
import userRouter from './authentication';
import AccountModel, { IAccountDocument } from '../resources/models/accountModel';
import BudgetModel, { IBudgetDocument } from '../resources/models/budgetModel';
import CategoryModel, { ICategoryDocument } from '../resources/models/categoryModel';
import GoalModel, { IGoalDocument } from '../resources/models/goalModel';
import BudgetRepo from '../resources/repositories/budgetRepo';
import GoalRepo from '../resources/repositories/goalRepo';
import type { IAccount, IBudget, ICategory, IGoal, IContentController } from '../types';

const logger = createLogger('RoutesInitializer');

/**
 * Standard routes are the routes that are created by the standardRouteFactory.
 * For controllers that are just require standard CRUD operations
 * 
 * @see {@link standardRouteFactory}
 */
const standardRoutes: { prefix: string; controller: IContentController }[] = [
  standardRouteFactory<IAccountDocument, IAccount>(AccountModel, 'account'),
  standardRouteFactory<ICategoryDocument, ICategory>(CategoryModel, 'category'),
  standardRouteFactory<IGoalDocument, IGoal>(GoalModel, 'goal', {
    repository: GoalRepo,
  }),
  standardRouteFactory<IBudgetDocument, IBudget>(BudgetModel, 'budget', {
    repository: BudgetRepo,
    contentManager: BudgetManager,
  }),
];

/**
 * Custom routes are the routes that are created by the customRouteFactory.
 * For controllers that are require custom logic
 * 
 * @see {@link customRouteFactory}
 */
const customRoutes: { prefix: string; router: Router }[] = [
  {
    prefix: 'user',
    router: userRouter,
  },
  {
    prefix: 'transaction',
    router: transactionRouter,
  },
];

/**
 * Adds a route to the express app
 * 
 * @param app - The express app
 * @param router - The router to add
 * @param prefix - The prefix to add
 */
function addRoute(app: Express, router: Router, prefix: string) {
  app.use(`${API_PREFIX}/${prefix}`, router);
  logger.info(`Route added: ${API_PREFIX}/${prefix}`);
}

/**
 * Sets the routes for the express app
 * 
 * @param app - The express app
 */
export default function setRoutes(app: Express) {
  standardRoutes.forEach((route) => {
    addRoute(app, contentRouterFactory(route.controller), route.prefix);
  });

  customRoutes.forEach((route) => {
    addRoute(app, route.router, route.prefix);
  });
}
