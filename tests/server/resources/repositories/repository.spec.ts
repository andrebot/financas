import chai, { should } from 'chai';
import sinon, { SinonStub } from 'sinon';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';
import Repository from '../../../../src/server/resources/repositories/repository';
import { categories } from '../../../../src/server/resources/models/categoryModel';
import { ICategory } from '../../../../src/server/types';

describe('Repository', () => {
  const dbHolder = databaseConnection as unknown as {
    db: Partial<Record<'select' | 'insert' | 'delete' | 'update', SinonStub>>;
  };

  let originalDb: unknown;
  const repository = Repository(categories, 'Category');

  const mockCategoryRow = {
    id: 1,
    name: 'Groceries',
    userId: 10,
    parentCategoryId: null as number | null,
    createdAt: new Date(),
    updatedAt: null as Date | null,
  };

  before(() => {
    originalDb = dbHolder.db;
  });

  afterEach(() => {
    dbHolder.db = originalDb as typeof dbHolder.db;
  });

  it('should be a repository factory function', () => {
    Repository.should.be.a('function');
  });

  describe('findById', () => {
    beforeEach(() => {
      const limitStub = sinon.stub().resolves([mockCategoryRow]);
      const whereStub = sinon.stub().returns({ limit: limitStub });
      const fromStub = sinon.stub().returns({ where: whereStub });
      const selectStub = sinon.stub().returns({ from: fromStub });
      dbHolder.db = { select: selectStub };
    });

    it('should return the object when an object is found', async () => {
      const selectStub = dbHolder.db.select as SinonStub;

      const result = await repository.findById(1);

      selectStub.should.have.been.calledOnce;
      should().exist(result);
      result!.should.deep.equal(mockCategoryRow);
    });

    it('should return null when no object matches id', async () => {
      const limitStub = sinon.stub().resolves([]);
      const whereStub = sinon.stub().returns({ limit: limitStub });
      const fromStub = sinon.stub().returns({ where: whereStub });
      const selectStub = sinon.stub().returns({ from: fromStub });
      dbHolder.db = { select: selectStub };

      const result = await repository.findById(999);

      should().not.exist(result);
    });

    it('should throw when id is null or undefined', async () => {
      const selectStub = sinon.stub();
      dbHolder.db = { select: selectStub };

      for (const badId of [undefined, null] as const) {
        try {
          await repository.findById(badId as unknown as number);
          chai.assert.fail('Should have thrown');
        } catch (err) {
          (err as Error).message.should.contain('Invalid id:');
        }
      }

      selectStub.should.not.have.been.called;
    });
  });

  describe('save', () => {
    it('should insert and return the saved object', async () => {
      const insertPayload = {
        name: 'test',
        userId: 10,
      };
      const returned = {
        id: 42,
        name: insertPayload.name,
        userId: insertPayload.userId,
        parentCategoryId: mockCategoryRow.parentCategoryId,
        createdAt: mockCategoryRow.createdAt,
        updatedAt: mockCategoryRow.updatedAt,
      };

      const returningStub = sinon.stub().resolves([returned]);
      const valuesStub = sinon.stub().returns({ returning: returningStub });
      const insertStub = sinon.stub().returns({ values: valuesStub });

      dbHolder.db = { insert: insertStub };

      const result = await repository.save(insertPayload as never);

      insertStub.should.have.been.calledOnceWithExactly(categories);
      valuesStub.should.have.been.calledOnceWith(insertPayload);
      returningStub.should.have.been.calledOnce;
      (result as unknown as ICategory).should.deep.equal(returned);
    });

    it('should throw when insert fails', async () => {
      const returningStub = sinon.stub().rejects(new Error('Test error'));
      const valuesStub = sinon.stub().returns({ returning: returningStub });
      dbHolder.db = { insert: sinon.stub().returns({ values: valuesStub }) };

      try {
        await repository.save({ name: 'x', userId: 1 } as never);
        chai.assert.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.contain('Test error');
      }
    });
  });

  describe('deleteById', () => {
    it('should delete by id and return the deleted object', async () => {
      const returningStub = sinon.stub().resolves([mockCategoryRow]);
      const whereStub = sinon.stub().returns({ returning: returningStub });
      dbHolder.db = { delete: sinon.stub().returns({ where: whereStub }) };

      const result = await repository.deleteById(mockCategoryRow.id);

      dbHolder.db.delete!.should.have.been.calledOnceWithExactly(categories);
      returningStub.should.have.been.calledOnce;
      chai.expect(result).to.deep.equal(mockCategoryRow);
    });

    it('should return null when no object matches id', async () => {
      const returningStub = sinon.stub().resolves([]);
      const whereStub = sinon.stub().returns({ returning: returningStub });
      dbHolder.db = { delete: sinon.stub().returns({ where: whereStub }) };

      const result = await repository.deleteById(1);

      should().not.exist(result);
    });
  });

  describe('update', () => {
    it('should update by id and return the updated object', async () => {
      const updated = { ...mockCategoryRow, name: 'renamed' };
      const returningStub = sinon.stub().resolves([updated]);
      const whereStub = sinon.stub().returns({ returning: returningStub });
      const setStub = sinon.stub().returns({ where: whereStub });

      dbHolder.db = {
        update: sinon.stub().returns({ set: setStub }),
      };

      const result = await repository.update(1, { name: 'renamed' } as never);

      dbHolder.db.update!.should.have.been.calledOnceWithExactly(categories);
      setStub.should.have.been.calledOnceWith({ name: 'renamed' });
      returningStub.should.have.been.calledOnce;
      (result as unknown as ICategory).should.deep.equal(updated);
    });

    it('should return null when no object matches id', async () => {
      const returningStub = sinon.stub().resolves([]);
      const whereStub = sinon.stub().returns({ returning: returningStub });
      dbHolder.db = {
        update: sinon.stub().returns({ set: sinon.stub().returns({ where: whereStub }) }),
      };

      const result = await repository.update(1, { name: 'nope' } as never);

      should().not.exist(result);
    });
  });

  describe('listAll', () => {
    it('should return all objects when no user filter is passed', async () => {
      const fromStub = sinon.stub().resolves([mockCategoryRow]);
      const selectStub = sinon.stub().returns({ from: fromStub });
      dbHolder.db = { select: selectStub };

      const rows = await repository.listAll();

      selectStub.should.have.been.calledOnce;
      fromStub.should.have.been.calledOnceWithExactly(categories);
      rows.should.deep.equal([mockCategoryRow]);
    });

    it('should filter by userId when provided', async () => {
      const whereStub = sinon.stub().resolves([mockCategoryRow]);
      const fromStub = sinon.stub().returns({ where: whereStub });
      const selectStub = sinon.stub().returns({ from: fromStub });
      dbHolder.db = { select: selectStub };

      const rows = await repository.listAll(10);

      fromStub.should.have.been.calledOnceWithExactly(categories);
      whereStub.should.have.been.calledOnce;
      chai.assert.exists(whereStub.firstCall.args[0]);
      rows.should.deep.equal([mockCategoryRow]);
    });
  });
});
