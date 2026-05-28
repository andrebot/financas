import { Logger } from 'winston';
import commonActions from './commonActions';
import { checkVoidInstance } from '../../utils/misc';
import type{ 
  ICommonActions,
  IGoalRepo,
  ITransactionRepo,
  IGoal,
} from '../../types';

/**
 * Creates the goal actions. Deleting a goal is different from the
 * standard delete
 *
 * @param goalRepo - The goal repository to use.
 * @param transactionRepo - The transaction repository to use.
 * @param logger - The logger to use.
 * @returns The goal actions.
 */
async function deleteGoal(
  id: number,
  goalRepo: IGoalRepo,
  transactionRepo: ITransactionRepo,
  logger: Logger,
): Promise<IGoal | null> {
  if (!id) {
    throw new Error('Goal id is required for deleting action');
  }

  logger.info(`Deleting goal: ${id}`);

  const goal = await goalRepo.deleteById(id);

  checkVoidInstance(goal, goalRepo.modelName, id);

  logger.info('Removing goal from transactions');

  await transactionRepo.deleteGoalFromTransactions(id);

  return goal;
}

/**
 * Creates the goal actions.
 *
 * @param goalRepo - The goal repository to use.
 * @param transactionRepo - The transaction repository to use.
 * @param logger - The logger to use.
 * @returns The goal actions.
 */
export default function createGoalActions(
  goalRepo: IGoalRepo,
  transactionRepo: ITransactionRepo,
  logger: Logger,
): ICommonActions<IGoal> {
  const commonGoalActions = commonActions(goalRepo, 'Goal');

  return {
    ...commonGoalActions,
    deleteContent: async (id: number): Promise<IGoal | null> => {
      return deleteGoal(id, goalRepo, transactionRepo, logger);
    }
  };
}
