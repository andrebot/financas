import { AnyBulkWriteOperation } from 'mongodb';
import mongoose from 'mongoose';
import Repository from './repository';
import GoalModel from '../models/goalModel';
import type { IGoal, IGoalDocument, BulkGoalsUpdate } from '../../types';

export class GoalRepo extends Repository<IGoalDocument, IGoal> {
  constructor(goalModel: typeof GoalModel = GoalModel) {
    super(goalModel);
  }

  /**
   * Updates the goals by a transaction. If the transaction is an update, the old value is
   * provided to calculate the difference.
   *
   * @param transaction - The transaction to update the goals by
   * @param oldTransactionValue - The old value of the transaction
   */
  async incrementGoalsInBulk(bulkGoalsUpdate: BulkGoalsUpdate[]): Promise<void> {
    this.logger.info(`Updating ${bulkGoalsUpdate.length} goals in bulk`);

    const goalsToUpdate = bulkGoalsUpdate.map(({ goalId, amount }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(goalId) },
        update: { $inc: { amount } },
        upsert: true,
      },
    })) as unknown as AnyBulkWriteOperation<IGoalDocument>[];

    if (goalsToUpdate.length > 0) {
      await this.Model.collection.bulkWrite(goalsToUpdate as any);
    }
  }
}

export default new GoalRepo();
