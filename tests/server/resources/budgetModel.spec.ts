import { should } from 'chai';
import mongoose from 'mongoose';
import sinon from 'sinon';
import BudgetModel, {
  BUDGET_TYPES,
  IBudget,
} from '../../../src/server/resources/budgetModel';
import transactionModel from '../../../src/server/resources/transactionModel';
import checkRequiredField from '../checkRequiredField';

describe('Transaction Model', () => {
  let budget: IBudget;

  beforeEach(() => {
    budget = new BudgetModel({
      name: 'Test Account',
      value: 100,
      type: BUDGET_TYPES.ANNUALY,
      startDate: new Date(),
      endDate: new Date(),
      categories: ['Test Category'],
      user: new mongoose.Types.ObjectId().toString(),
    });
  });

  it('should be invalid if name is empty', () => {
    checkRequiredField(budget, 'name');
  });

  it('should be invalid if value is empty', () => {
    checkRequiredField(budget, 'value');
  });

  it('should be invalid if type is empty', () => {
    checkRequiredField(budget, 'type');
  });

  it('should be invalid if type is not in the enum', () => {
    budget.type = ('invalid' as BUDGET_TYPES);
    const error = budget.validateSync();

    should().exist(error);
    error?.should.have.property('errors');
    error?.errors.should.have.property('type');
    error?.errors.type.should.have.property('kind').eql('enum');
  });

  it('should be invalid if startDate is empty', () => {
    checkRequiredField(budget, 'startDate');
  });

  it('should be invalid if endDate is empty', () => {
    checkRequiredField(budget, 'endDate');
  });

  it('should be invalid if categories is an empty array', () => {
    budget.categories = [];

    const error = budget.validateSync();

    should().exist(error);
    error?.should.have.property('errors');
    error?.errors.should.have.property('categories');
    error?.errors.categories.should.have.property('kind').eql('user defined');
    error?.errors.categories.should.have.property('message').eql('Categories must not be empty');
  });

  it('should be invalid if user is empty', () => {
    checkRequiredField(budget, 'user', 'ObjectId');
  });

  it('should be able to generate spent value', (done) => {
    sinon.stub(transactionModel, 'find').resolves([{
      value: 10,
    }, {
      value: 20,
    }, {
      value: 30,
    }]);

    budget.calculateSpent().then((spent) => {
      spent.should.eql(60);

      transactionModel.find.should.have.been.calledOnce;
      transactionModel.find.should.have.been.calledWith({
        user: budget.user,
        category: { $in: budget.categories },
        date: { $gte: budget.startDate, $lte: budget.endDate },
      });

      (transactionModel.find as sinon.SinonStub).restore();
      done();
    });
  });

  it('should be able to generate spent value as 0 with no transactions', (done) => {
    sinon.stub(transactionModel, 'find').resolves([]);

    budget.calculateSpent().then((spent) => {
      spent.should.eql(0);

      transactionModel.find.should.have.been.calledOnce;
      transactionModel.find.should.have.been.calledWith({
        user: budget.user,
        category: { $in: budget.categories },
        date: { $gte: budget.startDate, $lte: budget.endDate },
      });

      (transactionModel.find as sinon.SinonStub).restore();
      done();
    });
  });

  it('should be able to generate spent value as 0 if an error is thrown', (done) => {
    sinon.stub(transactionModel, 'find').rejects(new Error('Test Error'));

    budget.calculateSpent().then((spent) => {
      spent.should.eql(0);

      transactionModel.find.should.have.been.calledOnce;
      transactionModel.find.should.have.been.calledWith({
        user: budget.user,
        category: { $in: budget.categories },
        date: { $gte: budget.startDate, $lte: budget.endDate },
      });

      (transactionModel.find as sinon.SinonStub).restore();
      done();
    });
  });

  it('should be able to save', () => {
    const error = budget.validateSync();

    should().not.exist(error);
  });
});
