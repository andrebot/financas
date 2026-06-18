import { Logger } from 'winston';
import commonActions from './commonActions';
import { checkVoidInstance } from '../../utils/misc';
import type {
  IGoalRepo,
  IGoal,
  IGoalActions,
} from '../../types';

async function deleteGoal(
  id: number,
  goalRepo: IGoalRepo,
  logger: Logger,
): Promise<IGoal | null> {
  if (!id) {
    throw new Error('Goal id is required for deleting action');
  }

  logger.info(`Deleting goal: ${id}`);

  const goal = await goalRepo.deleteById(id);

  checkVoidInstance(goal, goalRepo.modelName, id);

  return goal;
}

async function listGoalsForMonth(
  year: number,
  month: number,
  goalRepo: IGoalRepo,
  logger: Logger,
): Promise<IGoal[]> {
  logger.info(`Listing goals for ${year}/${month}`);

  return goalRepo.listGoalsWithSavedValueUpTo(year, month);
}

export default function createGoalActions(
  goalRepo: IGoalRepo,
  logger: Logger,
): IGoalActions {
  const commonGoalActions = commonActions(goalRepo, 'Goal');

  return {
    ...commonGoalActions,
    deleteContent: async (id: number): Promise<IGoal | null> => deleteGoal(
      id,
      goalRepo,
      logger,
    ),
    listGoalsForMonth: async (year: number, month: number): Promise<IGoal[]> => listGoalsForMonth(
      year,
      month,
      goalRepo,
      logger,
    ),
  };
}
