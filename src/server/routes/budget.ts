import contentRouteFactory from './contentRouteFactory';
import BudgetModel, { IBudget } from '../resources/budgetModel';
import budgetController from '../controllers/budgetController';

export default contentRouteFactory<IBudget>(BudgetModel, 'budget', budgetController);
