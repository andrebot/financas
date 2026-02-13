import sinon from 'sinon';
import { should } from 'chai';
import { CategoryManager } from '../../../src/server/managers/categoryManager';
import { TransactionRepo } from '../../../src/server/resources/repositories/transactionRepo';
import { CategoryRepo } from '../../../src/server/resources/repositories/categoryRepo';

describe('CategoryManager', () => {
  const dumbCategory = {
    name: 'Test Category',
    user: '321',
    id: '123',
  };
  let categoryManager: CategoryManager;
  let categoryRepoStub: sinon.SinonStubbedInstance<CategoryRepo>;
  let transactionRepoStub: sinon.SinonStubbedInstance<TransactionRepo>;

  beforeEach(() => {
    categoryRepoStub = sinon.createStubInstance(CategoryRepo);
    transactionRepoStub = sinon.createStubInstance(TransactionRepo);
    categoryManager = new CategoryManager(categoryRepoStub, transactionRepoStub);
  
    categoryRepoStub.modelName = 'Category';
    transactionRepoStub.modelName = 'Transaction';
  });

  it('should not delete if no category id is provided', async () => {
    try {
      await categoryManager.deleteCategory('', '123', false);
    } catch (error) {
      should().exist(error);
      (error as Error).message.should.equal('Category id is required for deleting action');
    }
  });

  it('should throw when category is not found', async () => {
    categoryRepoStub.findById.resolves(null);

    try {
      await categoryManager.deleteCategory('123', '321', false);
      should().fail('Expected an error to be thrown');
    } catch (error) {
      should().exist(error);
      (error as Error).message.should.equal('Category not found with id 123');
    }

    categoryRepoStub.findById.should.have.been.calledOnce;
    categoryRepoStub.findByIdAndDelete.should.not.have.been.called;
    transactionRepoStub.removeCategoriesFromTransactions.should.not.have.been.called;
  });

  it('should not delete if the user is not allowed to delete the category', async () => {
    categoryRepoStub.findById.resolves({
      name: 'Test Category',
      user: '321',
      id: '123',
    });

    try {
      await categoryManager.deleteCategory('123', '123', false);
    } catch (error) {
      should().exist(error);
      (error as Error).message.should.equal('User 123 is not allowed to delete Category with id 123');
    }
  });

  it('should delete the category if the user is admin', async () => {
    categoryRepoStub.findById.resolves(dumbCategory);
    categoryRepoStub.findAllSubcategories.resolves([{
      name: 'Test Subcategory',
      user: '321',
      id: '456',
    }]);
    categoryRepoStub.deleteAllSubcategories.resolves(1);
    categoryRepoStub.findByIdAndDelete.resolves(dumbCategory);
    transactionRepoStub.removeCategoriesFromTransactions.resolves(1);
    
    const result = await categoryManager.deleteCategory('123', '6548', true);

    should().exist(result);

    categoryRepoStub.findById.should.have.been.calledOnce;
    categoryRepoStub.findByIdAndDelete.should.have.been.calledOnce;
    categoryRepoStub.findAllSubcategories.should.have.been.calledOnce;
    categoryRepoStub.deleteAllSubcategories.should.have.been.calledOnce;
    transactionRepoStub.removeCategoriesFromTransactions.should.have.been.calledOnce;
    result!.should.equal(dumbCategory);
  });

  it('should delete the category if the user is the owner', async () => {
    categoryRepoStub.findById.resolves(dumbCategory);
    categoryRepoStub.findAllSubcategories.resolves([{
      name: 'Test Subcategory',
      user: '321',
      id: '456',
    }]);
    categoryRepoStub.deleteAllSubcategories.resolves(1);
    categoryRepoStub.findByIdAndDelete.resolves(dumbCategory);
    transactionRepoStub.removeCategoriesFromTransactions.resolves(1);
    
    const result = await categoryManager.deleteCategory('123', '321', false);

    should().exist(result);

    categoryRepoStub.findById.should.have.been.calledOnce;
    categoryRepoStub.findByIdAndDelete.should.have.been.calledOnce;
    categoryRepoStub.findAllSubcategories.should.have.been.calledOnce;
    categoryRepoStub.deleteAllSubcategories.should.have.been.calledOnce;
    transactionRepoStub.removeCategoriesFromTransactions.should.have.been.calledOnce;
    result!.should.equal(dumbCategory);
  });

  it('should not delete subcategories if the category has no subcategories', async () => {
    categoryRepoStub.findById.resolves(dumbCategory);
    categoryRepoStub.findAllSubcategories.resolves([]);
    categoryRepoStub.findByIdAndDelete.resolves(dumbCategory);
    transactionRepoStub.removeCategoriesFromTransactions.resolves(1);
    
    const result = await categoryManager.deleteCategory('123', '321', false);
    
    should().exist(result);

    categoryRepoStub.findById.should.have.been.calledOnce;
    categoryRepoStub.findByIdAndDelete.should.have.been.calledOnce;
    categoryRepoStub.findAllSubcategories.should.have.been.calledOnce;
    categoryRepoStub.deleteAllSubcategories.should.not.have.been.called;
    transactionRepoStub.removeCategoriesFromTransactions.should.have.been.calledOnce;
    result!.should.equal(dumbCategory);
  });
});