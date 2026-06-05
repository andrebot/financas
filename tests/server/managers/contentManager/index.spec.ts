import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  createContentManager,
} from '../../../../src/server/managers/contentManager';
import { calculateBudgetSpent } from '../../../../src/server/managers/contentManager/budgetActions';
import {
  IBudget,
  ICategory,
  IGoal,
  IAccount,
} from '../../../../src/server/types';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';

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
  const dbHolder = databaseConnection as unknown as {
    db: { transaction: sinon.SinonStub };
  };
  let originalDb: unknown;
  const budgetRepoStub = createRepoStub();
  const budgetRepoExtendedStub = {
    ...budgetRepoStub,
    saveBudgetCategories: sinon.stub(),
    deleteBudgetCategories: sinon.stub(),
    listBudgetsWithCategories: sinon.stub(),
  };
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
  const accountRepoStub = {
    ...createRepoStub(),
    listAllWithCards: sinon.stub(),
  };
  const cardRepoStub = {
    ...createRepoStub(),
    findByAccountId: sinon.stub(),
    syncAccountCards: sinon.stub(),
  };

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

  before(() => {
    originalDb = dbHolder.db;
  });

  after(() => {
    dbHolder.db = originalDb as typeof dbHolder.db;
  });

  beforeEach(() => {
    dbHolder.db = {
      transaction: sinon.stub().callsFake(async (fn) => fn({})),
    };

    budgetRepoStub.save.resetHistory();
    budgetRepoStub.findById.resetHistory();
    budgetRepoStub.deleteById.resetHistory();
    budgetRepoStub.update.resetHistory();
    budgetRepoStub.listAll.resetHistory();
    budgetRepoExtendedStub.saveBudgetCategories.resetHistory();
    budgetRepoExtendedStub.deleteBudgetCategories.resetHistory();
    budgetRepoExtendedStub.listBudgetsWithCategories.resetHistory();

    categoryRepoStub.save.resetHistory();
    categoryRepoStub.findById.reset();
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
    accountRepoStub.listAllWithCards.resetHistory();

    cardRepoStub.save.resetHistory();
    cardRepoStub.findById.resetHistory();
    cardRepoStub.deleteById.resetHistory();
    cardRepoStub.update.resetHistory();
    cardRepoStub.listAll.resetHistory();
    cardRepoStub.findByAccountId.resetHistory();
    cardRepoStub.syncAccountCards.resetHistory();

    contentManager = createContentManager(
      budgetRepoExtendedStub as any,
      categoryRepoStub as any,
      goalRepoStub as any,
      transactionRepoStub as any,
      accountRepoStub as any,
      cardRepoStub as any,
    );
  });

  describe('accountActions', () => {
    it('should create account', async () => {
      const { id: _id, ...content } = mockAccount;
      const submittedCards = [{ number: '4111111111111111', expirationDate: '12/30' }];
      accountRepoStub.save.resolves({ ...content, id: 1 });
      cardRepoStub.syncAccountCards.resolves([{ ...submittedCards[0], id: 9, accountId: 1 }]);

      const result = await contentManager.accountActions.createContent({
        ...content,
        cards: submittedCards,
      });

      accountRepoStub.save.should.have.been.calledOnceWith(content);
      cardRepoStub.syncAccountCards.should.have.been.calledOnceWith(1, submittedCards);
      result.should.have.property('id', 1);
    });

    it('should update account cards when a full card list is provided', async () => {
      const submittedCards = [{ id: 9, number: '5555555555554444', expirationDate: '01/31' }];
      const updatedAccount = { ...mockAccount, name: 'Updated Checking' };
      accountRepoStub.update.resolves(updatedAccount);
      cardRepoStub.syncAccountCards.resolves(submittedCards.map((card) => ({ ...card, accountId: 1 })));

      const result = await contentManager.accountActions.updateContent(1, {
        name: updatedAccount.name,
        cards: submittedCards,
      });

      accountRepoStub.update.should.have.been.calledOnceWith(1, { name: updatedAccount.name });
      cardRepoStub.syncAccountCards.should.have.been.calledOnceWith(1, submittedCards);
      result!.should.deep.equal(updatedAccount);
    });

    it('should not sync account cards when cards are omitted from an update', async () => {
      const updatedAccount = { ...mockAccount, name: 'Updated Checking' };
      accountRepoStub.update.resolves(updatedAccount);

      await contentManager.accountActions.updateContent(1, { name: updatedAccount.name });

      accountRepoStub.update.should.have.been.calledOnceWith(1, { name: updatedAccount.name });
      cardRepoStub.syncAccountCards.should.not.have.been.called;
    });

    it('should list accounts with raw persisted cards', async () => {
      const persistedCard = {
        id: 9,
        number: '4111111111111111',
        expirationDate: '12/30',
        accountId: mockAccount.id,
        createdAt: new Date('2025-01-01'),
        updatedAt: null,
      };
      accountRepoStub.listAllWithCards.resolves([{ ...mockAccount, cards: [persistedCard] }]);

      const result = await contentManager.accountActions.listContent();

      accountRepoStub.listAllWithCards.should.have.been.calledOnce;
      cardRepoStub.findByAccountId.should.not.have.been.called;
      result.should.have.lengthOf(1);
      result[0].should.deep.equal({
        ...mockAccount,
        cards: [{
          id: persistedCard.id,
          number: persistedCard.number,
          expirationDate: persistedCard.expirationDate,
          accountId: persistedCard.accountId,
          createdAt: persistedCard.createdAt,
          updatedAt: persistedCard.updatedAt,
        }],
      });
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

    it('should reject budget creation without category ids', async () => {
      const { id: _id, spent: _spent, ...content } = mockBudget;

      try {
        await contentManager.budgetActions.createContent(content as IBudget);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('Budget requires at least one category');
      }

      budgetRepoStub.save.should.not.have.been.called;
      budgetRepoExtendedStub.saveBudgetCategories.should.not.have.been.called;
    });

    it('should create budget after validating submitted category ids', async () => {
      const { id: _id, spent: _spent, ...content } = mockBudget;
      const categoryIds = [1, 2];
      const submittedBudget = { ...content, categoryIds } as IBudget;
      budgetRepoStub.save.resolves({ ...content, id: 1 });
      categoryRepoStub.findById.onFirstCall().resolves(mockCategory);
      categoryRepoStub.findById.onSecondCall().resolves({ ...mockCategory, id: 2 });
      budgetRepoExtendedStub.saveBudgetCategories.resolves();

      const result = await contentManager.budgetActions.createContent(submittedBudget);

      categoryRepoStub.findById.should.have.been.calledWith(1);
      categoryRepoStub.findById.should.have.been.calledWith(2);
      budgetRepoExtendedStub.saveBudgetCategories.should.have.been.calledOnceWith(1, categoryIds);
      result.should.deep.include({ id: 1, categoryIds });
    });

    it('should reject budget creation when a submitted category id is invalid', async () => {
      const { id: _id, spent: _spent, ...content } = mockBudget;
      categoryRepoStub.findById.onFirstCall().resolves(mockCategory);
      categoryRepoStub.findById.onSecondCall().resolves(null);

      try {
        await contentManager.budgetActions.createContent({
          ...content,
          categoryIds: [1, 999],
        } as IBudget);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal('Budget contains invalid categories');
      }

      budgetRepoStub.save.should.not.have.been.called;
      budgetRepoExtendedStub.saveBudgetCategories.should.not.have.been.called;
    });

    it('should skip budget update when category ids are empty', async () => {
      const updatePayload = { name: 'Updated Budget', categoryIds: [] } as Partial<IBudget>;
      budgetRepoStub.findById.resolves(mockBudget);

      const result = await contentManager.budgetActions.updateContent(1, updatePayload);

      budgetRepoStub.findById.should.have.been.calledOnceWith(1);
      budgetRepoStub.update.should.not.have.been.called;
      chai.expect(result).to.not.be.null;
      result!.should.deep.equal(mockBudget);
    });

    it('should update budget fields and save non-empty category ids', async () => {
      const updatePayload = {
        name: 'Updated Budget',
        categoryIds: [1],
        categories: [mockCategory],
        spent: 25,
      } as Partial<IBudget>;
      const updatedBudget = { ...mockBudget, name: updatePayload.name! };
      categoryRepoStub.findById.resolves(mockCategory);
      budgetRepoStub.update.resolves(updatedBudget);
      budgetRepoExtendedStub.saveBudgetCategories.resolves();

      const result = await contentManager.budgetActions.updateContent(1, updatePayload);

      categoryRepoStub.findById.should.have.been.calledOnceWith(1);
      budgetRepoStub.update.should.have.been.calledOnceWith(1, { name: updatePayload.name });
      budgetRepoExtendedStub.saveBudgetCategories.should.have.been.calledOnceWith(1, [1]);
      chai.expect(result).to.not.be.null;
      result!.should.deep.equal({ ...updatedBudget, categoryIds: [1] });
    });

    it('should update budget fields without changing categories when category ids are omitted', async () => {
      const updatePayload = { name: 'Updated Budget' } as Partial<IBudget>;
      const updatedBudget = { ...mockBudget, name: updatePayload.name! };
      budgetRepoStub.update.resolves(updatedBudget);

      const result = await contentManager.budgetActions.updateContent(1, updatePayload);

      categoryRepoStub.findById.should.not.have.been.called;
      budgetRepoStub.update.should.have.been.calledOnceWith(1, updatePayload);
      budgetRepoExtendedStub.saveBudgetCategories.should.not.have.been.called;
      chai.expect(result).to.not.be.null;
      result!.should.deep.equal(updatedBudget);
    });

    it('should not save category links when a category update finds no budget', async () => {
      const updatePayload = { categoryIds: [1] } as Partial<IBudget>;
      categoryRepoStub.findById.resolves(mockCategory);
      budgetRepoStub.update.resolves(null);

      const result = await contentManager.budgetActions.updateContent(1, updatePayload);

      categoryRepoStub.findById.should.have.been.calledOnceWith(1);
      budgetRepoStub.update.should.have.been.calledOnceWith(1, {});
      budgetRepoExtendedStub.saveBudgetCategories.should.not.have.been.called;
      chai.expect(result).to.be.null;
    });

    it('should list budgets with hydrated categories', async () => {
      const budgets = [{ ...mockBudget, categories: [mockCategory] }];
      budgetRepoExtendedStub.listBudgetsWithCategories.resolves(budgets);

      const result = await contentManager.budgetActions.listContent();

      budgetRepoExtendedStub.listBudgetsWithCategories.should.have.been.calledOnce;
      budgetRepoStub.listAll.should.not.have.been.called;
      result.should.deep.equal(budgets);
    });

    it('should delete budget category links before deleting a budget', async () => {
      budgetRepoExtendedStub.deleteBudgetCategories.resolves();
      budgetRepoStub.deleteById.resolves(mockBudget);

      const result = await contentManager.budgetActions.deleteContent(1);

      budgetRepoExtendedStub.deleteBudgetCategories.should.have.been.calledOnceWith(1);
      budgetRepoStub.deleteById.should.have.been.calledOnceWith(1);
      chai.expect(result).to.not.be.null;
      result!.should.deep.equal(mockBudget);
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
        cardRepoStub as any,
      );

      chai.expect(manager).to.have.property('budgetActions');
      chai.expect(manager).to.have.property('categoryActions');
      chai.expect(manager).to.have.property('goalActions');
      chai.expect(manager).to.have.property('accountActions');
    });
  });
});
