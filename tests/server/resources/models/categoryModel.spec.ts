import { should } from 'chai';
import CategoryModel from '../../../../src/server/resources/models/categoryModel';
import { ICategoryDocument } from '../../../../src/server/types';
import checkRequiredField from '../../checkRequiredField';
import { Types } from 'mongoose';

describe('CategoryModel', () => {
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

  it('should be able to save with parentCategory', () => {
    (category as any).parentCategory = {
      details: new Types.ObjectId().toString(),
      name: 'Parent Category',
    };

    const error = category.validateSync();

    should().not.exist(error);
  });
});
