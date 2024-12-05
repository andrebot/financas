import { AnyBulkWriteOperation } from 'mongodb';
import { Repository } from './repository';
import GoalModel, { IGoalDocument } from '../models/goalModel';
import { IGoal, ITransaction, BulkGoalsUpdate } from '../../types';

class GoalRepo extends Repository<IGoalDocument, IGoal> {
  constructor() {
    super(GoalModel);
  }

  /**
   * Updates the goals by a transaction. If the transaction is an update, the old value is 
   * provided to calculate the difference.
   *
   * @param transaction - The transaction to update the goals by
   * @param oldTransactionValue - The old value of the transaction
   */
  async incrementGoalsInBulk(bulkGoalsUpdate: BulkGoalsUpdate[]): Promise<void> {
    const goalsToUpdate = bulkGoalsUpdate.map(({ goalId, amount }) => {
      return {
        updateOne: {
          filter: { _id: goalId },
          update: { $inc: { amount } },
        },
      };
    }) as unknown as AnyBulkWriteOperation<IGoalDocument>[];

    await this.model.bulkWrite(goalsToUpdate);
  }
}

export default new GoalRepo();
