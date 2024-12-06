import sinon from 'sinon';
import { GoalRepo } from '../../../../src/server/resources/repositories/goalRepo';

describe('Goal Repository', () => {
  let goalRepo: GoalRepo;
  let goalModel = {
    bulkWrite: sinon.stub(),
  };

  beforeEach(() => {
    goalModel.bulkWrite.reset();
    goalRepo = new GoalRepo(goalModel as any);
  });

  it('should update the goals by a bulk goals update', async () => {
    goalModel.bulkWrite.resolves();
    await goalRepo.incrementGoalsInBulk([
      { goalId: '1', amount: 100 },
      { goalId: '2', amount: 200 },
      { goalId: '3', amount: 300 },
    ]);

    goalModel.bulkWrite.should.have.been.calledOnce;
    goalModel.bulkWrite.should.have.been.calledWith([
      { updateOne: { filter: { _id: '1' }, update: { $inc: { amount: 100 } } } },
      { updateOne: { filter: { _id: '2' }, update: { $inc: { amount: 200 } } } },
      { updateOne: { filter: { _id: '3' }, update: { $inc: { amount: 300 } } } },
    ]);
  });
});
