import { should } from 'chai';
import sinon, { SinonStub } from 'sinon';
import categoryRepo from '../../../../src/server/resources/repositories/categoryRepo';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';
import { categories } from '../../../../src/server/resources/models/categoryModel';
import { budgetToCategories } from '../../../../src/server/resources/models/budgetModel';
import { requestContext } from '../../../../src/server/utils/authorization';

const runWithContext = (fn: () => Promise<unknown>) =>
  requestContext.run({ userId: 1, isAdmin: true }, fn);

describe('Category Repository', function () {
  const dbHolder = databaseConnection as unknown as {
    db: {
      select: SinonStub;
      delete: SinonStub;
    };
  };

  let originalDb: unknown;
  let selectStub: SinonStub;
  let selectFromStub: SinonStub;
  let selectInnerJoinStub: SinonStub;
  let selectWhereStub: SinonStub;
  let deleteStub: SinonStub;
  let deleteWhereStub: SinonStub;

  before(function () {
    originalDb = dbHolder.db;
  });

  beforeEach(function () {
    selectWhereStub = sinon.stub().resolves([]);
    selectInnerJoinStub = sinon.stub();
    selectInnerJoinStub.returns({ innerJoin: selectInnerJoinStub, where: selectWhereStub });
    selectFromStub = sinon.stub().returns({ where: selectWhereStub, innerJoin: selectInnerJoinStub });
    selectStub = sinon.stub().returns({ from: selectFromStub });

    deleteWhereStub = sinon.stub().resolves({ rowCount: 0 });
    deleteStub = sinon.stub().returns({ where: deleteWhereStub });

    dbHolder.db = {
      select: selectStub,
      delete: deleteStub,
    };
  });

  afterEach(function () {
    dbHolder.db = originalDb as { select: SinonStub; delete: SinonStub };
  });

  it('should find all subcategories of a parent category', async function () {
    const parentCategoryId = 1;
    const createdAt = new Date('2026-01-10');
    const dbRows = [
      {
        id: 10,
        name: 'Subcategory 1',
        userId: 99,
        parentCategoryId,
        createdAt,
        updatedAt: null as Date | null,
      },
    ];
    selectWhereStub.resolves(dbRows);

    const result = await runWithContext(() => categoryRepo.findAllSubcategories(parentCategoryId)) as Awaited<ReturnType<typeof categoryRepo.findAllSubcategories>>;

    selectStub.should.have.been.calledOnce;
    selectFromStub.should.have.been.calledOnceWithExactly(categories);
    selectWhereStub.should.have.been.calledOnce;

    result.should.be.an.instanceOf(Array);
    result.should.have.lengthOf(1);
    result[0].should.deep.equal(dbRows[0]);
  });

  it('should delete all subcategories of a parent category', async function () {
    const parentCategoryId = 42;
    const rowCount = 3;
    deleteWhereStub.resolves({ rowCount });

    const result = await runWithContext(() => categoryRepo.deleteAllSubcategories(parentCategoryId)) as number;

    deleteStub.should.have.been.calledOnceWithExactly(categories);
    deleteWhereStub.should.have.been.calledOnce;
    result.should.equal(rowCount);
  });

  describe('listCategoriesByBudgetId', function () {
    it('should return category ids linked to the budget', async function () {
      selectWhereStub.resolves([{ categoryId: 5 }, { categoryId: 10 }]);

      const result = await runWithContext(() => categoryRepo.listCategoriesByBudgetId(1)) as number[];

      selectStub.should.have.been.calledOnce;
      selectFromStub.should.have.been.calledOnceWithExactly(budgetToCategories);
      selectInnerJoinStub.should.have.been.calledTwice;
      selectWhereStub.should.have.been.calledOnce;
      result.should.deep.equal([5, 10]);
    });

    it('should return an empty array when no categories are linked', async function () {
      selectWhereStub.resolves([]);

      const result = await runWithContext(() => categoryRepo.listCategoriesByBudgetId(99)) as number[];

      result.should.be.an('array').that.is.empty;
    });
  });
});
