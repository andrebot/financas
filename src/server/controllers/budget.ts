import { Response } from 'express';
import contentControllerFactory from './contentFactory';
import BudgetModel, { IBudget } from '../resources/budgetModel';
import { RequestWithUser } from '../types';
import { handleError } from '../utils/responseHandlers';

const budgetController = contentControllerFactory<IBudget>(BudgetModel);

budgetController.getContent = async function getBudget(req: RequestWithUser, res: Response) {
  try {
    const { id: budgetId } = req.params;

    const budget = await BudgetModel.findById(budgetId);

    if (!budget) {
      return res.status(404).send('Budget not found');
    }

    const spentBudget = await budget.calculateSpent();

    return res.send(budget);
  } catch (error) {
    return handleError(error as Error, res);
  }
};

export default budgetController;
