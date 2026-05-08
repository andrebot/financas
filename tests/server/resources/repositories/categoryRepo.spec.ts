import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import categoryRepo from '../../../../src/server/resources/repositories/categoryRepo';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';
import { categories } from '../../../../src/server/resources/models/categoryModel';

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
  let selectWhereStub: SinonStub;
  let deleteStub: SinonStub;
  let deleteWhereStub: SinonStub;

  before(function () {
    originalDb = dbHolder.db;
  });

  beforeEach(function () {
    selectWhereStub = sinon.stub().resolves([]);
    selectFromStub = sinon.stub().returns({ where: selectWhereStub });
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

    const result = await categoryRepo.findAllSubcategories(parentCategoryId);

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

    const result = await categoryRepo.deleteAllSubcategories(parentCategoryId);

    deleteStub.should.have.been.calledOnceWithExactly(categories);
    deleteWhereStub.should.have.been.calledOnce;
    expect(result).to.equal(rowCount);
  });
});
