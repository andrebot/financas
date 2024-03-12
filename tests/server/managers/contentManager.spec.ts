import { should } from 'chai';
import sinon from 'sinon';
import {
  createContent,
  updateContent,
  deleteContent,
  listContent,
  getContent,
  getBudget,
} from '../../../src/server/managers/contentManager';
import { Types } from 'mongoose';

describe('contentManager', () => {
  const content = {
    name: 'test',
    user: new Types.ObjectId(),
    save: () => {},
    toObject: () => {},
  };
  let methodStubs: Record<string, sinon.SinonStub | string>;
  let contentModelStub: sinon.SinonStub;

  beforeEach(() => {
    methodStubs = {
      modelName: 'test',
      save: sinon.stub().resolves(content),
      toObject: sinon.stub().returns(content),
      findById: sinon.stub().resolves(content),
      findByIdAndDelete: sinon.stub().resolves(),
      find: sinon.stub().resolves([content]),
    };
    content.save = methodStubs.save as sinon.SinonStub;
    content.toObject = methodStubs.toObject as sinon.SinonStub
    contentModelStub = sinon.stub().returns(methodStubs);
  });

  describe('saveContent', () => {
    it('should save content', async () => {
      const result = await createContent(content, contentModelStub as any);
  
      should().exist(result);
      result.should.equal(content);
      contentModelStub.should.have.been.calledOnce;
      methodStubs.save.should.have.been.calledOnce;
      methodStubs.toObject.should.have.been.calledOnce;
    });
  
    it('should throw an error if no content is provided', async () => {
      (methodStubs.save as sinon.SinonStub).rejects(new Error('Error'));
  
      try {
        await createContent({}, contentModelStub as any);
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.equal('Error');
      }
    });
  });

  describe('updateContent', () => {
    it('should update content', async () => {
      const result = await updateContent(
        'id',
        { name: 'test2' },
        methodStubs as any,
        content.user.toString(),
      ) as any & { name: string };
  
      should().exist(result);
      result.should.equal(content);
      result.name.should.equal('test2');
      methodStubs.findById.should.have.been.calledOnce;
      content.save.should.have.been.calledOnce;
      content.toObject.should.have.been.calledOnce;
    });
  
    it('should update content if the user is admin', async () => {
      const result = await updateContent(
        'id',
        { name: 'test2' },
        methodStubs as any,
        new Types.ObjectId().toString(),
        true,
      ) as any & { name: string };
  
      should().exist(result);
      result.should.equal(content);
      result.name.should.equal('test2');
      methodStubs.findById.should.have.been.calledOnce;
      content.save.should.have.been.calledOnce;
      content.toObject.should.have.been.calledOnce;
    });
  
    it('should throw an error if no payload is provided', async () => {
      try {
        await updateContent('id', {}, methodStubs as any, content.user.toString());
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.contain(`No information provided to update ${methodStubs.modelName}`);
      }
    });
  
    it('should throw an error if the content is not found', async () => {
      (methodStubs.findById as sinon.SinonStub).resolves(null);
  
      try {
        await updateContent('id', { name: 'test2' }, methodStubs as any, content.user.toString());
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.contain(`${methodStubs.modelName} not found with id id`);
      }
    });
  
    it('should throw an error if the user is not allowed to update the content', async () => {
      const anotherUser = new Types.ObjectId().toString();
  
      try {
        await updateContent('id', { name: 'test2' }, methodStubs as any, anotherUser);
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.contain(`User ${anotherUser} is not allowed to update ${methodStubs.modelName} with id id`);
      }
    });
  
    it('should handle errors when updating content', async () => {
      (methodStubs.findById as sinon.SinonStub).rejects(new Error('Error'));
  
      try {
        await updateContent('id', { name: 'test2' }, methodStubs as any, content.user.toString());
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.equal('Error');
      }
    });
  });

  describe('deleteContent', () => {
    it('should delete content', async () => {
      const result = await deleteContent('id', methodStubs as any, content.user.toString()) as any & { name: string };
  
      should().exist(result);
      result.should.equal(content);
      methodStubs.findById.should.have.been.calledOnce;
      methodStubs.findByIdAndDelete.should.have.been.calledOnce;
      content.toObject.should.have.been.calledOnce;
    });

    it('should delete content if the user is admin', async () => {
      const result = await deleteContent('id', methodStubs as any, new Types.ObjectId().toString(), true) as any & { name: string };
  
      should().exist(result);
      result.should.equal(content);
      methodStubs.findById.should.have.been.calledOnce;
      methodStubs.findByIdAndDelete.should.have.been.calledOnce;
      content.toObject.should.have.been.calledOnce;
    });

    it('should throw an error if the content is not found', async () => {
      (methodStubs.findById as sinon.SinonStub).resolves(null);
  
      try {
        await deleteContent('id', methodStubs as any, content.user.toString());
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.contain(`${methodStubs.modelName} not found with id id`);
      }
    });

    it('should throw an error if the user is not allowed to delete the content', async () => {
      const anotherUser = new Types.ObjectId().toString();
  
      try {
        await deleteContent('id', methodStubs as any, anotherUser);
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.contain(`User ${anotherUser} is not allowed to delete ${methodStubs.modelName} with id id`);
      }
    });

    it('should handle errors when deleting content', async () => {
      (methodStubs.findById as sinon.SinonStub).rejects(new Error('Error'));
  
      try {
        await deleteContent('id', methodStubs as any, content.user.toString());
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.equal('Error');
      }
    });
  });

  describe('listContent', () => {
    it('should list content', async () => {
      const result = await listContent({}, methodStubs as any, content.user.toString());
  
      should().exist(result);
      result.should.deep.equal([content]);
      methodStubs.find.should.have.been.calledOnce;
    });

    it('should list all user\'s content if no query is provided', async () => {
      const result = await listContent(undefined, methodStubs as any, content.user.toString());
  
      should().exist(result);
      result.should.deep.equal([content]);
      methodStubs.find.should.have.been.calledOnce;
    });

    it('should handle errors when listing content', async () => {
      (methodStubs.find as sinon.SinonStub).rejects(new Error('Error'));
  
      try {
        await listContent({}, methodStubs as any, content.user.toString());
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.equal('Error');
      }
    });
  });

  describe('getContent', () => {
    it('should get content', async () => {
      const result = await getContent('id', methodStubs as any, content.user.toString());
  
      should().exist(result);
      result?.should.equal(content);
      methodStubs.findById.should.have.been.calledOnce;
    });

    it('should handle errors when getting content', async () => {
      (methodStubs.findById as sinon.SinonStub).rejects(new Error('Error'));
  
      try {
        await getContent('id', methodStubs as any, content.user.toString());
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.equal('Error');
      }
    });

    it('should return null if the content is not found', async () => {
      (methodStubs.findById as sinon.SinonStub).resolves(null);
  
      const result = await getContent('id', methodStubs as any, content.user.toString());
  
      should().not.exist(result);
    });
  });

  describe('getBudget', () => {
    it('should calculate spent when retrieving a valid budget', async () => {
      const budget = {
        name: 'test',
        value: 1000,
        type: 'monthly',
        startDate: new Date(),
        endDate: new Date(),
        categories: ['test'],
        user: new Types.ObjectId(),
        calculateSpent: sinon.stub().resolves(100),
      };
      (methodStubs.findById as sinon.SinonStub).resolves(budget);
      const result = await getBudget('id', methodStubs as any, budget.user.toString()) as any & { spent: number };
  
      should().exist(result);
      result.should.equal(budget);
      result.spent.should.equal(100);
      methodStubs.findById.should.have.been.calledOnce;
      budget.calculateSpent.should.have.been.calledOnce;
    });

    it('should return null if the budget is not found', async () => {	
      (methodStubs.findById as sinon.SinonStub).resolves(null);
  
      const result = await getBudget('id', methodStubs as any, content.user.toString());
  
      should().not.exist(result);
    });

    it('should throw an error if anything goes wrong', async () => {
      (methodStubs.findById as sinon.SinonStub).rejects(new Error('Error'));
  
      try {
        await getBudget('id', methodStubs as any, content.user.toString());
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.equal('Error');
      }
    });
  });
});