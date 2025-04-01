import chai, { should } from 'chai';
import sinon from 'sinon';
import { Document } from 'mongoose';
import Repository from '../../../../src/server/resources/repositories/repository';

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
});
