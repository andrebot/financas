import { should } from 'chai';
import { Types } from 'mongoose';
import GoalModel, { IGoalDocument } from '../../../../src/server/resources/models/goalModel';
import checkRequiredField from '../../checkRequiredField';

describe('GoalModel', () => {
  let goal: IGoalDocument;

  beforeEach(() => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);

    goal = new GoalModel({
      name: 'Test goal',
      value: 100,
      dueDate,
      user: new Types.ObjectId().toString(),
    });
  });

  it('should be invalid if name is empty', () => {
    checkRequiredField(goal, 'name');
  });

  it('should be invalid if agency is empty', () => {
    checkRequiredField(goal, 'value');
  });

  it('should be invalid if accountNumber is empty', () => {
    checkRequiredField(goal, 'dueDate');
  });

  it('should be invalid if user is empty', () => {
    checkRequiredField(goal, 'user', 'ObjectId');
  });

  it('should be able to save', () => {
    const error = goal.validateSync();

    should().not.exist(error);
  });
});
