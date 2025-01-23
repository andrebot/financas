import sinon from 'sinon';
import { Types } from 'mongoose';
import { GoalRepo } from '../../../../src/server/resources/repositories/goalRepo';

describe('Goal Repository', () => {
  let goalRepo: GoalRepo;
  let goalModel = {
    collection: {
      bulkWrite: sinon.stub(),
    },
  };

  beforeEach(() => {
    goalModel.collection.bulkWrite.reset();
    goalRepo = new GoalRepo(goalModel as any);
  });

  it('should update the goals by a bulk goals update', async () => {
    const goalIds = [new Types.ObjectId().toString(), new Types.ObjectId().toString(), new Types.ObjectId().toString()];

    goalModel.collection.bulkWrite.resolves();
    await goalRepo.incrementGoalsInBulk([
      { goalId: goalIds[0], amount: 100 },
      { goalId: goalIds[1], amount: 200 },
      { goalId: goalIds[2], amount: 300 },
    ]);

    goalModel.collection.bulkWrite.should.have.been.calledOnce;
    goalModel.collection.bulkWrite.should.have.been.calledWith([
      { updateOne: { filter: { _id: new Types.ObjectId(goalIds[0]) }, update: { $inc: { amount: 100 } }, upsert: true } },
      { updateOne: { filter: { _id: new Types.ObjectId(goalIds[1]) }, update: { $inc: { amount: 200 } }, upsert: true } },
      { updateOne: { filter: { _id: new Types.ObjectId(goalIds[2]) }, update: { $inc: { amount: 300 } }, upsert: true } },
    ]);
  });

  it('should not call bulkWrite if no goals are provided', async () => {
    await goalRepo.incrementGoalsInBulk([]);

    goalModel.collection.bulkWrite.should.not.have.been.called;
  });
});

