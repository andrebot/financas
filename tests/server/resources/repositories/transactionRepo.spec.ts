import sinon from 'sinon';
import { TransactionRepo } from '../../../../src/server/resources/repositories/transactionRepo';

describe('TransactionRepo', () => {
  let transactionRepo: TransactionRepo;
  let transactionModel: {
    find: sinon.SinonStub;
    updateMany: sinon.SinonStub;
  };

  beforeEach(() => {
    transactionModel = {
      find: sinon.stub(),
      updateMany: sinon.stub(),
    };
    transactionRepo = new TransactionRepo(transactionModel as any);
  });

  describe('findByCategoryWithDateRange', () => {
    it('should find transactions by category and date range', async () => {
      const userId = 'user-1';
      const categories = ['Food', 'Transport'];
      const startDate = new Date('2021-01-01');
      const endDate = new Date('2021-01-31');

      transactionModel.find.resolves([{ id: '1', value: 100 }]);

      const transactions = await transactionRepo.findByCategoryWithDateRange(
        userId,
        categories,
        startDate,
        endDate,
      );

      transactionModel.find.should.have.been.calledOnce;
      transactionModel.find.should.have.been.calledWith({
        user: userId,
        category: { $in: categories },
        date: { $gte: startDate, $lte: endDate },
      });
      transactions.should.be.an('array');
      transactions.should.have.lengthOf(1);
      transactions[0].should.have.property('id', '1');
    });

    it('should return empty array when no transactions found', async () => {
      transactionModel.find.resolves([]);

      const transactions = await transactionRepo.findByCategoryWithDateRange(
        'user-1',
        ['Food'],
        new Date('2021-01-01'),
        new Date('2021-01-31'),
      );

      transactions.should.be.an('array').that.is.empty;
    });
  });

  describe('removeCategoriesFromTransactions', () => {
    it('should remove categories from transactions', async () => {
      const categoryIds = ['cat-1', 'cat-2'];

      transactionModel.updateMany.resolves({ modifiedCount: 2 });

      const result = await transactionRepo.removeCategoriesFromTransactions(categoryIds);

      transactionModel.updateMany.should.have.been.calledOnce;
      transactionModel.updateMany.should.have.been.calledWith(
        { category: { $in: categoryIds } },
        { $unset: { category: 1 } },
      );
      result.should.equal(2);
    });

    it('should return 0 when no transactions updated', async () => {
      transactionModel.updateMany.resolves({ modifiedCount: 0 });

      const result = await transactionRepo.removeCategoriesFromTransactions(['cat-999']);

      result.should.equal(0);
    });
  });

  describe('deleteGoalFromTransactions', () => {
    it('should delete goal from transactions', async () => {
      const goalId = 'goal-123';

      transactionModel.updateMany.resolves({ modifiedCount: 3 });

      const result = await transactionRepo.deleteGoalFromTransactions(goalId);

      transactionModel.updateMany.should.have.been.calledOnce;
      transactionModel.updateMany.should.have.been.calledWith(
        { goalsList: { $elemMatch: { goal: goalId } } },
        { $pull: { goalsList: { goal: goalId } } },
      );
      result.should.equal(3);
    });

    it('should return 0 when no transactions contain the goal', async () => {
      transactionModel.updateMany.resolves({ modifiedCount: 0 });

      const result = await transactionRepo.deleteGoalFromTransactions('goal-999');

      result.should.equal(0);
    });
  });
});
