import sinon from 'sinon';
import { TransactionRepo } from '../../../../src/server/resources/repositories/transactionRepo';

describe('TransactionRepo', function() {
  let transactionRepo: TransactionRepo;
  let transactionModel = {
    find: sinon.stub(),
  };

  beforeEach(function() {
    transactionModel.find.reset();
    transactionRepo = new TransactionRepo(transactionModel as any);
  });
  
  it('should find transactions by category and date range', async function() {
    const userId = '1';
    const categories = ['1', '2'];
    const startDate = new Date('2021-01-01');
    const endDate = new Date('2021-01-31');
    
    transactionModel.find.resolves([{ id: '1' }]);

    const transactions = await transactionRepo.findByCategoryWithDateRange(userId, categories, startDate, endDate);

    transactionModel.find.should.have.been.calledOnce;
    transactionModel.find.should.have.been.calledWith({
      user: userId,
      category: { $in: categories },
      date: { $gte: startDate, $lte: endDate },
    });

    transactions.should.be.an.instanceOf(Array);
    transactions.should.have.lengthOf(1);
  });
});