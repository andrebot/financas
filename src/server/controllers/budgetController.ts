import ContentController from './contentController';
import BudgetManager from '../managers/budgetManager';

import type { IBudget } from '../types';

export default new ContentController<IBudget>(BudgetManager, 'BudgetController');
