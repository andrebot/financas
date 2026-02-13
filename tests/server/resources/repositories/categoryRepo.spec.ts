import sinon from 'sinon';
import { CategoryRepo } from '../../../../src/server/resources/repositories/categoryRepo';

describe('Category Repository', function() {
  let categoryRepo: CategoryRepo;
  let categoryModel = {
    find: sinon.stub(),
    deleteMany: sinon.stub(),
  };

  beforeEach(function() {
    categoryModel.find.reset();
    categoryModel.deleteMany.reset();
    categoryRepo = new CategoryRepo(categoryModel as any);
  });

  it('should find all subcategories of a parent category', async function() {
    const parentCategoryId = '1';
    const subcategories = [{ id: '1', name: 'Subcategory 1' }];
    
    categoryModel.find.resolves(subcategories);

    const result = await categoryRepo.findAllSubcategories(parentCategoryId);

    categoryModel.find.should.have.been.calledOnce;
    categoryModel.find.should.have.been.calledWith({ parentCategory: parentCategoryId });
    result.should.be.an.instanceOf(Array);
    result.should.have.lengthOf(1);
    result[0].should.equal(subcategories[0]);
  });

  it('should delete all subcategories of a parent category', async function() {
    const parentCategoryId = '1';
    const deletedCount = 1;
    categoryModel.deleteMany.resolves({ deletedCount });

    const result = await categoryRepo.deleteAllSubcategories(parentCategoryId);

    categoryModel.deleteMany.should.have.been.calledOnce;
    categoryModel.deleteMany.should.have.been.calledWith({ parentCategory: parentCategoryId });
    result.should.equal(deletedCount);
  });
});