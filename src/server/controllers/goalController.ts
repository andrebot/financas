import { Response } from 'express';
import CommonController from './commonController';
import { createLogger } from '../utils/logger';
import { checkVoidUser } from '../utils/misc';
import { handleError } from '../utils/responseHandlers';
import type {
  ICommonController,
  IGoal,
  RequestWithUser,
  IGoalActions,
} from '../types';

const logger = createLogger('GoalController');

async function listGoals(req: RequestWithUser, res: Response, manager: IGoalActions): Promise<Response<IGoal>> {
  try {
    checkVoidUser(req.user, 'Goal', 'list');

    const { year, month } = req.query;

    if (year && month) {
      const goals = await manager.listGoalsForMonth(Number(year), Number(month));

      logger.info(`Listed ${goals.length} goals for ${year}/${month}`);
      return res.send(goals);
    }

    const goals = await manager.listContent();
    logger.info(`Listed ${goals.length} goals`);
    return res.send(goals);
  } catch (error) {
    logger.error(error);
    return handleError(error as Error, res);
  }
}

export default function GoalController(manager: IGoalActions): ICommonController<IGoal> {
  const commonController = CommonController<IGoal>(manager, 'Goal');

  return {
    ...commonController,
    listContent: async (req: RequestWithUser, res: Response): Promise<Response<IGoal>> => listGoals(
      req,
      res,
      manager,
    ),
  };
}
