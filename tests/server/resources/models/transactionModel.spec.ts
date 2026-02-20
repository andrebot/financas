import { should } from 'chai';
import mongoose from 'mongoose';
import TransactionModel from '../../../../src/server/resources/models/transactionModel';
import { ITransactionDocument } from '../../../../src/server/types';
import checkRequiredField from '../../checkRequiredField';
import { INVESTMENT_TYPES, IGoalItem, TRANSACTION_TYPES } from '../../../../src/server/types';

describe('Transaction Model', () => {
  let transaction: ITransactionDocument;

  beforeEach(() => {
    transaction = new TransactionModel({
      name: 'Test Account',
      category: 'Test Category',
      parentCategory: 'Test Parent Category',
      account: new mongoose.Types.ObjectId().toString(),
      type: TRANSACTION_TYPES.WITHDRAW,
      date: new Date(),
      value: 100,
      user: new mongoose.Types.ObjectId().toString(),
      goalsList: [],
    });
  });

  it('should be invalid if name is empty', () => {
    checkRequiredField(transaction, 'name');
  });

  it('should be invalid if category is empty', () => {
    checkRequiredField(transaction, 'category');
  });

  it('should be invalid if parentCategory is empty', () => {
    checkRequiredField(transaction, 'parentCategory');
  });

  it('should be invalid if account is empty', () => {
    checkRequiredField(transaction, 'account', 'ObjectId');
  });

  it('should be invalid if type is empty', () => {
    checkRequiredField(transaction, 'type');
  });

  it('should be invalid if type is not in the enum', () => {
    transaction.type = ('invalid' as TRANSACTION_TYPES);
    const error = transaction.validateSync();

    should().exist(error);
    error?.should.have.property('errors');
    error?.errors.should.have.property('type');
    error?.errors.type.should.have.property('kind').eql('enum');
  });

  it('should be invalid if date is empty', () => {
    checkRequiredField(transaction, 'date');
  });

  it('should be invalid if value is empty', () => {
    checkRequiredField(transaction, 'value');
  });

  it('should be invalid if investmentType is not in the enum', () => {
    transaction.investmentType = ('invalid' as INVESTMENT_TYPES);
    const error = transaction.validateSync();

    should().exist(error);
    error?.should.have.property('errors');
    error?.errors.should.have.property('investmentType');
    error?.errors.investmentType.should.have.property('kind').eql('enum');
  });

  it('should be invalid if user is empty', () => {
    checkRequiredField(transaction, 'user', 'ObjectId');
  });

  it('should be valid if goalsList is empty', () => {
    transaction.goalsList = [];
    const error = transaction.validateSync();

    should().not.exist(error);
  });

  it('should be valid if goalsList is not empty', () => {
    transaction.goalsList = [{
      goal: new mongoose.Types.ObjectId(),
      goalName: 'Test Goal', 
      percentage: 0.5,
    }]; // Explicitly cast the object to IGoalItem
    const error = transaction.validateSync();

    should().not.exist(error);
  });

  it('should be invalid if goalsList has an invalid goal', () => {
    transaction.goalsList = [{
      goal: new mongoose.Types.ObjectId(),
      goalName: 'Test Goal',
      percentage: 1.5,
    }]; // Explicitly cast the object to IGoalItem
    const error = transaction.validateSync();

    should().exist(error);
    error?.should.have.property('errors');
    error?.errors.should.have.property('goalsList.0.percentage');
    error?.errors['goalsList.0.percentage'].should.have.property('kind').eql('max');
  });

  it('should be able to save', () => {
    const error = transaction.validateSync();

    should().not.exist(error);
  });
});
