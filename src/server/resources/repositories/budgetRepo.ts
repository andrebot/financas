import BudgetModel, { IBudgetDocument } from '../models/budgetModel';
import { Repository } from './repository';
import { IBudget } from '../../types';

export default new Repository<IBudgetDocument, IBudget>(BudgetModel);
