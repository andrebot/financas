import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  createContentManager,
  calculateBudgetSpent,
} from '../../../../src/server/managers/contentManager';
import {
  IBudget,
  ICategory,
  IGoal,
  IAccount,
  BUDGET_TYPES,
} from '../../../../src/server/types';

chai.use(sinonChai);
chai.should();

const createRepoStub = () => ({
  save: sinon.stub(),
  findById: sinon.stub(),
  findByIdAndDelete: sinon.stub(),
  update: sinon.stub(),
  listAll: sinon.stub(),
  modelName: 'Test',
});

describe('ContentManager', () => {
  const budgetRepoStub = createRepoStub();
  const categoryRepoStub = {
    ...createRepoStub(),
    findAllSubcategories: sinon.stub(),
    deleteAllSubcategories: sinon.stub(),
  };
  const goalRepoStub = createRepoStub();
  const transactionRepoStub = {
    deleteGoalFromTransactions: sinon.stub(),
    removeCategoriesFromTransactions: sinon.stub(),
    findByCategoryWithDateRange: sinon.stub().resolves([]),
  };
  const accountRepoStub = createRepoStub();

  let contentManager: ReturnType<typeof createContentManager>;

  const mockBudget: IBudget = {
    id: 'budget-1',
    name: 'Test Budget',
    value: 1000,
    type: BUDGET_TYPES.MONTHLY,
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 31),
    categories: ['Food', 'Transport'],
    user: 'user-123',
  };

  const mockCategory: ICategory = {
    id: 'cat-1',
    name: 'Food',
    user: 'user-123',
  };

  const mockGoal: IGoal = {
    id: 'goal-1',
    name: 'Vacation',
    value: 5000,
    dueDate: new Date(2024, 11, 31),
    user: 'user-123',
    savedValue: 1000,
  };

  const mockAccount: IAccount = {
    id: 'acc-1',
    name: 'Checking',
    agency: '0001',
    accountNumber: '12345',
    currency: 'BRL',
    user: 'user-123',
    cards: [],
  };

  beforeEach(() => {
    budgetRepoStub.save.resetHistory();
    budgetRepoStub.findById.resetHistory();
    budgetRepoStub.findByIdAndDelete.resetHistory();
    budgetRepoStub.update.resetHistory();
    budgetRepoStub.listAll.resetHistory();

    categoryRepoStub.save.resetHistory();
    categoryRepoStub.findById.resetHistory();
    categoryRepoStub.findByIdAndDelete.resetHistory();
    categoryRepoStub.update.resetHistory();
    categoryRepoStub.listAll.resetHistory();
    categoryRepoStub.findAllSubcategories.resetHistory();
    categoryRepoStub.deleteAllSubcategories.resetHistory();

    goalRepoStub.save.resetHistory();
    goalRepoStub.findById.resetHistory();
    goalRepoStub.findByIdAndDelete.resetHistory();
    goalRepoStub.update.resetHistory();
    goalRepoStub.listAll.resetHistory();

    transactionRepoStub.deleteGoalFromTransactions.resetHistory();
    transactionRepoStub.removeCategoriesFromTransactions.resetHistory();
    transactionRepoStub.findByCategoryWithDateRange.resetHistory();

    accountRepoStub.save.resetHistory();
    accountRepoStub.findById.resetHistory();
    accountRepoStub.findByIdAndDelete.resetHistory();
    accountRepoStub.update.resetHistory();
    accountRepoStub.listAll.resetHistory();

    contentManager = createContentManager(
      budgetRepoStub as any,
      categoryRepoStub as any,
      goalRepoStub as any,
      transactionRepoStub as any,
      accountRepoStub as any,
    );
  });

  describe('accountActions', () => {
    it('should create account', async () => {
      const content = { ...mockAccount };
      delete content.id;
      accountRepoStub.save.resolves({ ...content, id: 'acc-1' });

      const result = await contentManager.accountActions.createContent(content);

      accountRepoStub.save.should.have.been.calledOnceWith(content);
      result.should.have.property('id', 'acc-1');
    });

    it('should list accounts', async () => {
      accountRepoStub.listAll.resolves([mockAccount]);

      const result = await contentManager.accountActions.listContent('user-123');

      accountRepoStub.listAll.should.have.been.calledOnceWith('user-123');
      result.should.have.lengthOf(1);
      result[0].should.deep.equal(mockAccount);
    });

    it('should get account', async () => {
      accountRepoStub.findById.resolves(mockAccount);

      const result = await contentManager.accountActions.getContent('acc-1', 'user-123', false);

      accountRepoStub.findById.should.have.been.calledWith('acc-1');
      chai.expect(result).to.not.be.null;
      result!.should.deep.equal(mockAccount);
    });

    it('should return null when account not found', async () => {
      accountRepoStub.findById.resolves(null);

      const result = await contentManager.accountActions.getContent('acc-999', 'user-123', false);

      chai.expect(result).to.be.null;
    });
  });

  describe('budgetActions', () => {
    it('should get budget with spent value', async () => {
      budgetRepoStub.findById.resolves(mockBudget);
      transactionRepoStub.findByCategoryWithDateRange.resolves([
        { value: 100 },
        { value: 200 },
      ]);

      const result = await contentManager.budgetActions.getContent('budget-1', 'user-123', false);

      budgetRepoStub.findById.should.have.been.calledWith('budget-1');
      transactionRepoStub.findByCategoryWithDateRange.should.have.been.calledOnce;
      chai.expect(result).to.not.be.null;
      result!.should.have.property('spent', 300);
      result!.should.have.property('id', 'budget-1');
    });

    it('should return null when budget not found', async () => {
      budgetRepoStub.findById.resolves(null);

      const result = await contentManager.budgetActions.getContent('budget-999', 'user-123', false);

      chai.expect(result).to.be.null;
    });

    it('should create budget', async () => {
      const content = { ...mockBudget };
      delete content.id;
      budgetRepoStub.save.resolves({ ...content, id: 'budget-1' });

      const result = await contentManager.budgetActions.createContent(content);

      budgetRepoStub.save.should.have.been.calledOnce;
      result.should.have.property('id', 'budget-1');
    });

    it('should throw when calculateBudgetSpent is called with null budget', async () => {
      const loggerStub = { info: sinon.stub() };

      try {
        await calculateBudgetSpent(null, transactionRepoStub as any, loggerStub as any);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('We need a budget to calculate the spent');
      }
    });
  });

  describe('categoryActions', () => {
    it('should throw when category id is missing for delete', async () => {
      try {
        await contentManager.categoryActions.deleteContent('', 'user-123', false);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('Category id is required for deleting action');
      }
    });

    it('should throw when category not found', async () => {
      categoryRepoStub.findById.resolves(null);

      try {
        await contentManager.categoryActions.deleteContent('cat-999', 'user-123', false);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.include('not found');
      }
    });

    it('should throw when user not authorized to delete category', async () => {
      categoryRepoStub.findById.resolves({ ...mockCategory, user: 'other-user' });

      try {
        await contentManager.categoryActions.deleteContent('cat-1', 'user-123', false);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.include('not allowed to delete');
      }
    });

    it('should delete category with subcategories', async () => {
      const subcategory = { id: 'cat-2', name: 'Sub', user: 'user-123' };
      categoryRepoStub.findById.resolves(mockCategory);
      categoryRepoStub.findAllSubcategories.resolves([subcategory]);
      categoryRepoStub.deleteAllSubcategories.resolves(1);
      categoryRepoStub.findByIdAndDelete.resolves(mockCategory);
      transactionRepoStub.removeCategoriesFromTransactions.resolves(2);

      const result = await contentManager.categoryActions.deleteContent('cat-1', 'user-123', false);

      categoryRepoStub.findById.should.have.been.calledWith('cat-1');
      categoryRepoStub.findAllSubcategories.should.have.been.calledWith('cat-1');
      categoryRepoStub.deleteAllSubcategories.should.have.been.calledWith('cat-1');
      transactionRepoStub.removeCategoriesFromTransactions.should.have.been.calledWith([
        'cat-1',
        'cat-2',
      ]);
      categoryRepoStub.findByIdAndDelete.should.have.been.calledWith('cat-1');
      chai.expect(result).to.not.be.null;
      result!.should.deep.equal(mockCategory);
    });

    it('should delete category without subcategories', async () => {
      categoryRepoStub.findById.resolves(mockCategory);
      categoryRepoStub.findAllSubcategories.resolves([]);
      categoryRepoStub.findByIdAndDelete.resolves(mockCategory);
      transactionRepoStub.removeCategoriesFromTransactions.resolves(1);

      const result = await contentManager.categoryActions.deleteContent('cat-1', 'user-123', false);

      categoryRepoStub.deleteAllSubcategories.should.not.have.been.called;
      transactionRepoStub.removeCategoriesFromTransactions.should.have.been.calledWith(['cat-1']);
      chai.expect(result).to.not.be.null;
      result!.should.deep.equal(mockCategory);
    });

    it('should allow admin to delete any category', async () => {
      categoryRepoStub.findById.resolves({ ...mockCategory, user: 'other-user' });
      categoryRepoStub.findAllSubcategories.resolves([]);
      categoryRepoStub.findByIdAndDelete.resolves(mockCategory);
      transactionRepoStub.removeCategoriesFromTransactions.resolves(1);

      const result = await contentManager.categoryActions.deleteContent('cat-1', 'admin-1', true);

      chai.expect(result).to.not.be.null;
      result!.should.deep.equal(mockCategory);
    });
  });

  describe('goalActions', () => {
    it('should throw when goal id is missing for delete', async () => {
      try {
        await contentManager.goalActions.deleteContent('', 'user-123', false);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('Goal id is required for deleting action');
      }
    });

    it('should throw when goal not found', async () => {
      goalRepoStub.findById.resolves(null);

      try {
        await contentManager.goalActions.deleteContent('goal-999', 'user-123', false);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.include('not found');
      }
    });

    it('should throw when user not authorized to delete goal', async () => {
      goalRepoStub.findById.resolves({ ...mockGoal, user: 'other-user' });

      try {
        await contentManager.goalActions.deleteContent('goal-1', 'user-123', false);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.include('not allowed to delete');
      }
    });

    it('should delete goal and remove from transactions', async () => {
      goalRepoStub.findById.resolves(mockGoal);
      goalRepoStub.findByIdAndDelete.resolves(mockGoal);
      transactionRepoStub.deleteGoalFromTransactions.resolves(2);

      const result = await contentManager.goalActions.deleteContent('goal-1', 'user-123', false);

      goalRepoStub.findById.should.have.been.calledWith('goal-1');
      transactionRepoStub.deleteGoalFromTransactions.should.have.been.calledWith('goal-1');
      goalRepoStub.findByIdAndDelete.should.have.been.calledWith('goal-1');
      chai.expect(result).to.not.be.null;
      result!.should.deep.equal(mockGoal);
    });

    it('should create goal', async () => {
      const content = { ...mockGoal };
      delete content.id;
      goalRepoStub.save.resolves({ ...content, id: 'goal-1' });

      const result = await contentManager.goalActions.createContent(content);

      goalRepoStub.save.should.have.been.calledOnce;
      result.should.have.property('id', 'goal-1');
    });
  });

  describe('createContentManager factory', () => {
    it('should accept custom repos', () => {
      const customBudgetRepo = createRepoStub();
      const manager = createContentManager(
        customBudgetRepo as any,
        categoryRepoStub as any,
        goalRepoStub as any,
        transactionRepoStub as any,
        accountRepoStub as any,
      );

      chai.expect(manager).to.have.property('budgetActions');
      chai.expect(manager).to.have.property('categoryActions');
      chai.expect(manager).to.have.property('goalActions');
      chai.expect(manager).to.have.property('accountActions');
    });
  });
});
