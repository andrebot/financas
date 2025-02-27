import { should } from 'chai';
import sinon from 'sinon';
import { Document } from 'mongoose';
import { Repository } from '../../../../src/server/resources/repositories/repository';

interface IMockModel {
  name: string;
  user?: string;
  id?: string;
}

interface IMockModelDocument extends Omit<IMockModel, 'id'>, Document {}

const findStub = sinon.stub();
const findByIdStub = sinon.stub();
const findByIdAndDeleteStub = sinon.stub();
const findByIdAndUpdateStub = sinon.stub();
const findOneStub = sinon.stub();
const saveStub = sinon.stub();

class MockModel {
  static find = findStub;
  static findById = findByIdStub;
  static findByIdAndDelete = findByIdAndDeleteStub;
  static findByIdAndUpdate = findByIdAndUpdateStub;
  static findOne = findOneStub;
  save = saveStub;

  constructor(data: any) {
    Object.assign(this, data);
  }
}

describe('Repository', () => {
  let repository: Repository<IMockModelDocument, IMockModel>;

  before(() => {
    repository = new Repository<IMockModelDocument, IMockModel>(MockModel as any);
  });

  beforeEach(() => {
    findStub.reset();
    findByIdStub.reset();
    findByIdAndDeleteStub.reset();
    findOneStub.reset();
    saveStub.reset();
    findByIdAndUpdateStub.reset();
  });

  it('should be a class', () => {
    Repository.should.be.a('function');
  });

  it('should find document by id', async () => {
    findByIdStub.returns({
      toObject: sinon.stub().returns(Promise.resolve({ name: 'test' })),
    });

    const result = await repository.findById('1');

    should().exist(result);
    findByIdStub.should.have.been.calledOnceWithExactly('1');
    result!.should.be.deep.equal({ name: 'test' });
  });

  it('should find document by id and delete', async () => {
    findByIdAndDeleteStub.returns({
      toObject: sinon.stub().resolves({ name: 'test' }),
    });

    const result = await repository.findByIdAndDelete('1');

    should().exist(result);
    findByIdAndDeleteStub.should.have.been.calledOnceWithExactly('1');
    result!.should.be.deep.equal({ name: 'test' });
  });

  it('should save document', async () => {
    const mockReturn = { name: 'test' };

    saveStub.resolves({
      toObject: () => mockReturn,
    });

    const result = await repository.save(mockReturn);

    should().exist(result);
    saveStub.should.have.been.calledOnce;
    result!.should.be.deep.equal(mockReturn);
  });

  it('should handle an error if the document is not saved', async () => {
    const mockReturn = { name: 'test' };
    saveStub.rejects(new Error('Test error'));

    try {
      await repository.save(mockReturn);
      chai.assert.fail('Should have thrown an error');
    } catch (error) {
      (error as Error).message.should.contain('Test error');
    }
  });

  it('should update document', async () => {
    findByIdAndUpdateStub.returns({
      toObject: sinon.stub().resolves({ name: 'test' }),
    });

    const result = await repository.update('1', { name: 'test' });

    should().exist(result);
    findByIdAndUpdateStub.should.have.been.calledOnceWithExactly('1', { name: 'test' }, { new: true, runValidators: true });
    result!.should.be.deep.equal({ name: 'test' });
  });

  it('should return null if document to delete is not found', async () => {
    findByIdAndDeleteStub.resolves(null);

    const result = await repository.findByIdAndDelete('1');

    should().not.exist(result);
  });

  it('should return null if the document by id to find is not found', async () => {
    findByIdStub.resolves(null);

    const result = await repository.findById('1');

    should().not.exist(result);
  });

  it('should return null if the document to update is not found', async () => {
    findByIdAndUpdateStub.resolves(null);

    const result = await repository.update('1', { name: 'test' });

    should().not.exist(result);
  });

  describe('Queries', () => {
    beforeEach(() => {
      findStub.reset();
      findOneStub.reset();

      findStub.resolves([{ toObject: sinon.stub().returns({ name: 'test' }) }]);
      findOneStub.returns({
        toObject: sinon.stub().resolves({ name: 'test' }),
      });
    });

    it('should search for all documents if no query is provided', async () => {
      const result = await repository.find();

      should().exist(result);
      findStub.should.have.been.calledOnce;
      result!.should.be.deep.equal([{ name: 'test' }]);
    });

    it('should search for one document', async () => {
      let result = await repository.findOne({ name: 'test' });

      should().exist(result);
      findOneStub.should.have.been.calledOnceWithExactly({ name: 'test' });
      result!.should.be.deep.equal({ name: 'test' });

      result = await repository.findOne({ user: 'test', id: '1' });

      should().exist(result);
      findOneStub.should.have.been.calledWithExactly({ user: 'test', _id: '1' });
      result!.should.be.deep.equal({ name: 'test' });
    });

    it('should throw an error if query is empty', async () => {
      try {
        await repository.findOne({});
        chai.assert.fail('Should have thrown an error');
      } catch (error) {
        (error as Error).message.should.contain('Cannot search for one instance with empty query');
      }
    });

    it('should throw an error if query is null', async () => {
      try {
        await repository.findOne(null as any);
        chai.assert.fail('Should have thrown an error');
      } catch (error) {
        (error as Error).message.should.contain('Cannot search for one instance with empty query');
      }
    });

    it('should search for documents by query', async () => {
      const result = await repository.find({ name: 'test' });

      should().exist(result);
      findStub.should.have.been.calledOnceWithExactly({ name: 'test' });
      result!.should.be.deep.equal([{ name: 'test' }]);
    });

    it('should search for documents by query with in operator', async () => {
      const result = await repository.find({ name: { in: ['test'] } });

      should().exist(result);
      findStub.should.have.been.calledOnceWithExactly({ name: { $in: ['test'] } });
      result!.should.be.deep.equal([{ name: 'test' }]);
    });

    it('should search for documents by query with equals operator', async () => {
      const result = await repository.find({ name: { equals: 'test' } });

      should().exist(result);
      findStub.should.have.been.calledOnceWithExactly({ name: { $eq: 'test' } });
      result!.should.be.deep.equal([{ name: 'test' }]);
    });

    it('should search for documents by query with not operator', async () => {
      const result = await repository.find({ name: { not: 'test' } });

      should().exist(result);
      findStub.should.have.been.calledOnceWithExactly({ name: { $ne: 'test' } });
      result!.should.be.deep.equal([{ name: 'test' }]);
    });

    it('should search for documents by query with notIn operator', async () => {
      const result = await repository.find({ name: { notIn: ['test'] } });

      should().exist(result);
      findStub.should.have.been.calledOnceWithExactly({ name: { $nin: ['test'] } });
      result!.should.be.deep.equal([{ name: 'test' }]);
    });

    it('should search for documents by query with lt operator', async () => {
      const result = await repository.find({ name: { lt: 'test' } });

      should().exist(result);
      findStub.should.have.been.calledOnceWithExactly({ name: { $lt: 'test' } });
      result!.should.be.deep.equal([{ name: 'test' }]);
    });

    it('should search for documents by query with lte operator', async () => {
      const result = await repository.find({ name: { lte: 'test' } });

      should().exist(result);
      findStub.should.have.been.calledOnceWithExactly({ name: { $lte: 'test' } });
      result!.should.be.deep.equal([{ name: 'test' }]);
    });

    it('should search for documents by query with gt operator', async () => {
      const result = await repository.find({ name: { gt: 'test' } });

      should().exist(result);
      findStub.should.have.been.calledOnceWithExactly({ name: { $gt: 'test' } });
      result!.should.be.deep.equal([{ name: 'test' }]);
    });

    it('should search for documents by query with gte operator', async () => {
      const result = await repository.find({ name: { gte: 'test' } });

      should().exist(result);
      findStub.should.have.been.calledOnceWithExactly({ name: { $gte: 'test' } });
      result!.should.be.deep.equal([{ name: 'test' }]);
    });

    it('should search for documents by query with contains operator', async () => {
      const result = await repository.find({ name: { contains: 'test' } });

      should().exist(result);
      findStub.should.have.been.calledOnceWithExactly({ name: { $regex: /test/i } });
      result!.should.be.deep.equal([{ name: 'test' }]);
    });

    it('should search for documents by query with startsWith operator', async () => {
      const result = await repository.find({ name: { startsWith: 'test' } });

      should().exist(result);
      findStub.should.have.been.calledOnceWithExactly({ name: { $regex: /^test/i } });
      result!.should.be.deep.equal([{ name: 'test' }]);
    });

    it('should search for documents by query with endsWith operator', async () => {
      const result = await repository.find({ name: { endsWith: 'test' } });

      should().exist(result);
      findStub.should.have.been.calledOnceWithExactly({ name: { $regex: /test$/i } });
      result!.should.be.deep.equal([{ name: 'test' }]);
    });

    it('should throw an error if contains operator is used with undefined value and is the only query', async () => {
      try {
        await repository.findOne({ name: { contains: undefined } });
        chai.assert.fail('Should have thrown an error');
      } catch (error) {
        (error as Error).message.should.contain('Cannot search for one instance with empty query');
      }
    });

    it('should ignore undefined values in query', async () => {
      const result = await repository.find({ name: { contains: undefined } });

      should().exist(result);
      findStub.should.have.been.calledOnceWithExactly({});
      result!.should.be.deep.equal([{ name: 'test' }]);
    });

    it('should return null if the one document to find is not found', async () => {
      findOneStub.resolves(null);

      const result = await repository.findOne({ name: 'test' });

      should().not.exist(result);
    });
  });
});
