import { Response } from 'express';
import contentControllerFactory from './contentFactory';
import budgetModel from '../resources/budgetModel';
import { getBudget } from '../managers/contentManager';
import { RequestWithUser } from '../types';
import { handleError } from '../utils/responseHandlers';

const budgetController = contentControllerFactory(budgetModel);

/**
 * Get budget by id. If the user is an admin, they can get any budget.
 *
 * @param req - The request object
 * @param res - The response object
 * @returns The budget
 */
budgetController.getContent = async function getBudgetController(
  req: RequestWithUser,
  res: Response,
) {
  try {
    const { id: contentId } = req.params;

    const content = await getBudget(contentId, budgetModel, req.user?.id);

    return res.send(content);
  } catch (error) {
    return handleError(error as Error, res);
  }
};

export default budgetController;
