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

function addRoute(app: Express, router: Router, prefix: string) {
  app.use(`${API_PREFIX}/${prefix}`, router);
  logger.info(`Route added: ${API_PREFIX}/${prefix}`);
}

export default function setRoutes(app: Express) {
  standardRoutes.forEach((route) => {
    addRoute(app, contentRouterFactory(route.controller), route.prefix);
  });

  customRoutes.forEach((route) => {
    addRoute(app, route.router, route.prefix);
  });
}
