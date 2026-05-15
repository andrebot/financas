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
} from '../../../../src/server/types';

chai.use(sinonChai);
chai.should();

const createRepoStub = () => ({
  save: sinon.stub(),
  findById: sinon.stub(),
  deleteById: sinon.stub(),
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
    listCategoriesByBudgetId: sinon.stub(),
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
    id: 1,
    name: 'Test Budget',
    value: '1000.00',
    type: 'monthly',
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 31),
    userId: 1,
    createdAt: new Date(),
    updatedAt: null,
    spent: 0,
  } as IBudget;

  const mockCategory: ICategory = {
    id: 1,
    name: 'Food',
    userId: 1,
    parentCategoryId: null,
    createdAt: new Date(),
    updatedAt: null,
  } as ICategory;

  const mockGoal: IGoal = {
    id: 1,
    name: 'Vacation',
    value: 5000,
    savedValue: '1000.00',
    dueDate: new Date(2024, 11, 31),
    archived: false,
    userId: 1,
    createdAt: new Date(),
    updatedAt: null,
  } as IGoal;

  const mockAccount: IAccount = {
    id: 1,
    name: 'Checking',
    agency: '0001',
    accountNumber: '12345',
    currency: 'BRL',
    initialBalance: '0.00',
    userId: 1,
    createdAt: new Date(),
    updatedAt: null,
  } as IAccount;

  beforeEach(() => {
    budgetRepoStub.save.resetHistory();
    budgetRepoStub.findById.resetHistory();
    budgetRepoStub.deleteById.resetHistory();
    budgetRepoStub.update.resetHistory();
    budgetRepoStub.listAll.resetHistory();

    categoryRepoStub.save.resetHistory();
    categoryRepoStub.findById.resetHistory();
    categoryRepoStub.deleteById.resetHistory();
    categoryRepoStub.update.resetHistory();
    categoryRepoStub.listAll.resetHistory();
    categoryRepoStub.findAllSubcategories.resetHistory();
    categoryRepoStub.deleteAllSubcategories.resetHistory();
    categoryRepoStub.listCategoriesByBudgetId.resetHistory();

    goalRepoStub.save.resetHistory();
    goalRepoStub.findById.resetHistory();
    goalRepoStub.deleteById.resetHistory();
    goalRepoStub.update.resetHistory();
    goalRepoStub.listAll.resetHistory();

    transactionRepoStub.deleteGoalFromTransactions.resetHistory();
    transactionRepoStub.removeCategoriesFromTransactions.resetHistory();
    transactionRepoStub.findByCategoryWithDateRange.resetHistory();
    transactionRepoStub.findByCategoryWithDateRange.resolves([]);

    accountRepoStub.save.resetHistory();
    accountRepoStub.findById.resetHistory();
    accountRepoStub.deleteById.resetHistory();
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
      const { id: _id, ...content } = mockAccount;
      accountRepoStub.save.resolves({ ...content, id: 1 });

      const result = await contentManager.accountActions.createContent(content as IAccount);

      accountRepoStub.save.should.have.been.calledOnceWith(content);
      result.should.have.property('id', 1);
    });

    it('should list accounts', async () => {
      accountRepoStub.listAll.resolves([mockAccount]);

      const result = await contentManager.accountActions.listContent();

      accountRepoStub.listAll.should.have.been.calledOnce;
      result.should.have.lengthOf(1);
      result[0].should.deep.equal(mockAccount);
    });

    it('should get account by id', async () => {
      accountRepoStub.findById.resolves(mockAccount);

      const result = await contentManager.accountActions.getContent(1);

      accountRepoStub.findById.should.have.been.calledWith(1);
      chai.expect(result).to.not.be.null;
      result!.should.deep.equal(mockAccount);
    });

    it('should return null when account not found', async () => {
      accountRepoStub.findById.resolves(null);

      const result = await contentManager.accountActions.getContent(999);

      chai.expect(result).to.be.null;
    });
  });

  describe('budgetActions', () => {
    it('should get budget with computed spent value', async () => {
      budgetRepoStub.findById.resolves(mockBudget);
      categoryRepoStub.listCategoriesByBudgetId.resolves([1, 2]);
      transactionRepoStub.findByCategoryWithDateRange.resolves([
        { value: '100.00' },
        { value: '200.00' },
      ]);

      const result = await contentManager.budgetActions.getContent(1);

      budgetRepoStub.findById.should.have.been.calledWith(1);
      transactionRepoStub.findByCategoryWithDateRange.should.have.been.calledOnce;
      chai.expect(result).to.not.be.null;
      result!.should.have.property('spent', 300);
      result!.should.have.property('id', 1);
    });

    it('should return null when budget not found', async () => {
      budgetRepoStub.findById.resolves(null);

      const result = await contentManager.budgetActions.getContent(999);

      chai.expect(result).to.be.null;
    });

    it('should create budget', async () => {
      const { id: _id, spent: _spent, ...content } = mockBudget;
      budgetRepoStub.save.resolves({ ...content, id: 1 });

      const result = await contentManager.budgetActions.createContent(content as IBudget);

      budgetRepoStub.save.should.have.been.calledOnce;
      result.should.have.property('id', 1);
    });

    it('should throw when calculateBudgetSpent is called with null budget', async () => {
      const loggerStub = { info: sinon.stub() };

      try {
        await calculateBudgetSpent(null, transactionRepoStub as any, categoryRepoStub as any, loggerStub as any);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('We need a budget to calculate the spent');
      }
    });
  });

  describe('categoryActions', () => {
    it('should throw when category id is zero', async () => {
      try {
        await contentManager.categoryActions.deleteContent(0);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('Category id is required for deleting action');
      }
    });

    it('should delete category and its subcategories', async () => {
      const subcategory: ICategory = { ...mockCategory, id: 2, name: 'Sub' };
      categoryRepoStub.findAllSubcategories.resolves([subcategory]);
      categoryRepoStub.deleteAllSubcategories.resolves(1);
      categoryRepoStub.deleteById.resolves(mockCategory);
      transactionRepoStub.removeCategoriesFromTransactions.resolves(2);

      const result = await contentManager.categoryActions.deleteContent(1);

      categoryRepoStub.findAllSubcategories.should.have.been.calledWith(1);
      categoryRepoStub.deleteAllSubcategories.should.have.been.calledWith(1);
      transactionRepoStub.removeCategoriesFromTransactions.should.have.been.calledWith([1, 2]);
      categoryRepoStub.deleteById.should.have.been.calledWith(1);
      chai.expect(result).to.not.be.null;
      result!.should.deep.equal(mockCategory);
    });

    it('should delete category without subcategories', async () => {
      categoryRepoStub.findAllSubcategories.resolves([]);
      categoryRepoStub.deleteById.resolves(mockCategory);
      transactionRepoStub.removeCategoriesFromTransactions.resolves(1);

      const result = await contentManager.categoryActions.deleteContent(1);

      categoryRepoStub.deleteAllSubcategories.should.not.have.been.called;
      transactionRepoStub.removeCategoriesFromTransactions.should.have.been.calledWith([1]);
      chai.expect(result).to.not.be.null;
      result!.should.deep.equal(mockCategory);
    });
  });

  describe('goalActions', () => {
    it('should throw when goal id is zero', async () => {
      try {
        await contentManager.goalActions.deleteContent(0);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('Goal id is required for deleting action');
      }
    });

    it('should throw when goal is not found', async () => {
      goalRepoStub.deleteById.resolves(null);

      try {
        await contentManager.goalActions.deleteContent(999);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.include('not found');
      }
    });

    it('should delete goal and remove from transactions', async () => {
      goalRepoStub.deleteById.resolves(mockGoal);
      transactionRepoStub.deleteGoalFromTransactions.resolves(2);

      const result = await contentManager.goalActions.deleteContent(1);

      goalRepoStub.deleteById.should.have.been.calledWith(1);
      transactionRepoStub.deleteGoalFromTransactions.should.have.been.calledWith(1);
      chai.expect(result).to.not.be.null;
      result!.should.deep.equal(mockGoal);
    });

    it('should create goal', async () => {
      const { id: _id, ...content } = mockGoal;
      goalRepoStub.save.resolves({ ...content, id: 1 });

      const result = await contentManager.goalActions.createContent(content as IGoal);

      goalRepoStub.save.should.have.been.calledOnce;
      result.should.have.property('id', 1);
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
