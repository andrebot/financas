import { should } from 'chai';
import CategoryModel, { ICategoryDocument } from '../../../../src/server/resources/models/categoryModel';
import checkRequiredField from '../../checkRequiredField';
import { Types } from 'mongoose';

describe('AccountModel', () => {
  let category: ICategoryDocument;

  beforeEach(() => {
    category = new CategoryModel({
      name: 'Test Account',
      user: new Types.ObjectId().toString(),
    });
  });

  it('should be invalid if name is empty', () => {
    checkRequiredField(category, 'name');
  });

  it('should be invalid if user is empty', () => {
    checkRequiredField(category, 'user', 'ObjectId');
  });

  it('should be able to save', () => {
    const error = category.validateSync();

    should().not.exist(error);
  });
});
