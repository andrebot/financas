import { should } from 'chai';
import sinon from 'sinon';
import ContentManager from '../../../src/server/managers/contentManager';
import { Types } from 'mongoose';
import Repository from '../../../src/server/resources/repositories/repository';

describe('contentManager', () => {
  const content = {
    name: 'test',
    user: new Types.ObjectId().toHexString(),
  };
  let repositoryStub: sinon.SinonStubbedInstance<Repository<any, any>>;
  let manager: ContentManager<any>;

  beforeEach(() => {
    repositoryStub = sinon.createStubInstance<Repository<any, any>>(Repository as any);
    repositoryStub.modelName = 'test';
    manager = new ContentManager(repositoryStub as any);
  });

  describe('saveContent', () => {
    it('should save content', async () => {
      repositoryStub.save.resolves(content);
      const result = await manager.createContent(content);
  
      should().exist(result);
      result.should.equal(content);
      repositoryStub.save.should.have.been.calledOnce;
    });
  
    it('should throw an error if no content is provided', async () => {
      try {
        await manager.createContent({});
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.equal('No information provided to create test');
      }
    });
  });

  describe('updateContent', () => {
    it('should update content', async () => {
      repositoryStub.findById.resolves(content);
      repositoryStub.update.resolves(content);

      const result = await manager.updateContent(
        'id',
        { name: 'test2' },
        content.user,
      );
  
      should().exist(result);
      result.should.deep.equal(content);
      repositoryStub.findById.should.have.been.calledOnce;
      repositoryStub.update.should.have.been.calledOnce;
    });
  
    it('should update content if the user is admin', async () => {
      const updatedContent = { ...content, name: 'test2' };
      repositoryStub.findById.resolves(content);
      repositoryStub.update.resolves(updatedContent);

      const result = await manager.updateContent(
        'id',
        { name: 'test2' },
        new Types.ObjectId().toString(),
        true,
      );
  
      should().exist(result);
      result.should.deep.equal(updatedContent);
      repositoryStub.findById.should.have.been.calledOnce;
      repositoryStub.update.should.have.been.calledOnce;
    });
  
    it('should throw an error if no payload is provided', async () => {
      try {
        await manager.updateContent('id', {}, content.user);
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.contain(`No information provided to update ${repositoryStub.modelName}`);
      }
    });
  
    it('should throw an error if the content is not found', async () => {
      repositoryStub.findById.resolves(null);
  
      try {
        await manager.updateContent('id', { name: 'test2' }, content.user);
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.contain(`${repositoryStub.modelName} not found with id id`);
      }
    });
  
    it('should throw an error if the user is not allowed to update the content', async () => {
      const anotherUser = new Types.ObjectId().toString();
      repositoryStub.findById.resolves(content);
  
      try {
        await manager.updateContent('id', { name: 'test2' }, anotherUser);
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.contain(`User ${anotherUser} is not allowed to update ${repositoryStub.modelName} with id id`);
      }
    });
  
    it('should handle errors when updating content', async () => {
      repositoryStub.findById.rejects(new Error('Error'));
  
      try {
        await manager.updateContent('id', { name: 'test2' }, content.user);
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.equal('Error');
      }

      repositoryStub.findById.resolves(content);
      repositoryStub.update.rejects(new Error('Error'));

      try {
        await manager.updateContent('id', { name: 'test2' }, content.user);
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.equal('Error');
      }
    });
  });

  describe('deleteContent', () => {
    it('should delete content', async () => {
      repositoryStub.findById.resolves(content);
      repositoryStub.findByIdAndDelete.resolves(content);

      const result = await manager.deleteContent('id', content.user);
  
      should().exist(result);
      result.should.equal(content);
      repositoryStub.findById.should.have.been.calledOnce;
      repositoryStub.findByIdAndDelete.should.have.been.calledOnce;
    });

    it('should delete content if the user is admin', async () => {
      repositoryStub.findById.resolves(content);
      repositoryStub.findByIdAndDelete.resolves(content);
      const result = await manager.deleteContent('id', new Types.ObjectId().toString(), true);
  
      should().exist(result);
      result.should.equal(content);
      repositoryStub.findById.should.have.been.calledOnce;
      repositoryStub.findByIdAndDelete.should.have.been.calledOnce;
    });

    it('should throw an error if the content is not found', async () => {
      repositoryStub.findById.resolves(null);
  
      try {
        await manager.deleteContent('id', content.user, false);
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.contain(`${repositoryStub.modelName} not found with id id`);
      }
    });

    it('should throw an error if the user is not allowed to delete the content', async () => {
      const anotherUser = new Types.ObjectId().toString();
      repositoryStub.findById.resolves(content);
  
      try {
        await manager.deleteContent('id', anotherUser, false);
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.contain(`User ${anotherUser} is not allowed to delete ${repositoryStub.modelName} with id id`);
      }
    });

    it('should handle errors when deleting content', async () => {
      repositoryStub.findById.rejects(new Error('Error'));
  
      try {
        await manager.deleteContent('id', content.user, false);
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.equal('Error');
      }

      repositoryStub.findById.resolves(content);
      repositoryStub.findByIdAndDelete.rejects(new Error('Error'));

      try {
        await manager.deleteContent('id', content.user, false);
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.equal('Error');
      }
    });
  });

  describe('listContent', () => {
    it('should list all user\'s content', async () => {
      repositoryStub.listAll.resolves([content]);
      const result = await manager.listContent(content.user);
  
      should().exist(result);
      result.should.deep.equal([content]);
      repositoryStub.listAll.should.have.been.calledOnce;
    });

    it('should handle errors when listing content', async () => {
      repositoryStub.listAll.rejects(new Error('Error'));
  
      try {
        await manager.listContent(content.user);
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.equal('Error');
      }
    });
  });

  describe('getContent', () => {
    it('should get content', async () => {
      repositoryStub.findById.resolves(content);
      const result = await manager.getContent('id');
  
      should().exist(result);
      result?.should.equal(content);
      repositoryStub.findById.should.have.been.calledOnce;
    });

    it('should handle errors when getting content', async () => {
      repositoryStub.findById.rejects(new Error('Error'));
  
      try {
        await manager.getContent('id');
        should().fail();
      } catch (err) {
        should().exist(err);
        (err as Error).message.should.equal('Error');
      }
    });

    it('should return null if the content is not found', async () => {
      repositoryStub.findById.resolves(null);
  
      const result = await manager.getContent('id');
  
      should().not.exist(result);
    });
  });
});