import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CommonActions from '../../../../src/server/managers/contentManager/commonActions';
import type { ICategory } from '../../../../src/server/types';

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

describe('CommonActions', () => {
  const modelName = 'Test';
  const repoStub = createRepoStub();
  let commonActions: ReturnType<typeof CommonActions<any, ICategory>>;

  const mockContent: ICategory = {
    id: 'content-1',
    user: 'user-123',
    name: 'Test Content',
  };

  beforeEach(() => {
    repoStub.save.resetHistory();
    repoStub.findById.resetHistory();
    repoStub.findByIdAndDelete.resetHistory();
    repoStub.update.resetHistory();
    repoStub.listAll.resetHistory();

    commonActions = CommonActions(repoStub as any, modelName);
  });

  describe('createContent', () => {
    it('should create content successfully', async () => {
      const content = { ...mockContent };
      delete content.id;
      repoStub.save.resolves({ ...content, id: 'content-1' });

      const result = await commonActions.createContent(content);

      repoStub.save.should.have.been.calledOnceWith(content);
      result.should.have.property('id', 'content-1');
    });

    it('should throw when payload is void', async () => {
      try {
        await commonActions.createContent({} as ICategory);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal(
          `No information provided to create ${modelName}`,
        );
      }
      repoStub.save.should.not.have.been.called;
    });

    it('should throw when payload is empty object', async () => {
      try {
        await commonActions.createContent({} as ICategory);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.include('No information provided');
      }
    });
  });

  describe('updateContent', () => {
    it('should update content successfully', async () => {
      repoStub.findById.resolves(mockContent);
      repoStub.update.resolves({ ...mockContent, name: 'Updated' });

      const result = await commonActions.updateContent(
        'content-1',
        { name: 'Updated' } as Partial<ICategory>,
        'user-123',
        false,
      );

      repoStub.findById.should.have.been.calledWith('content-1');
      repoStub.update.should.have.been.calledWith('content-1', { name: 'Updated' });
      chai.expect(result).to.not.be.null;
      result!.should.have.property('name', 'Updated');
    });

    it('should throw when payload is void', async () => {
      try {
        await commonActions.updateContent('content-1', {} as Partial<ICategory>, 'user-123', false);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal(
          `No information provided to update ${modelName}`,
        );
      }
      repoStub.update.should.not.have.been.called;
    });

    it('should throw when content not found', async () => {
      repoStub.findById.resolves(null);

      try {
        await commonActions.updateContent(
          'content-999',
          { name: 'Updated' } as Partial<ICategory>,
          'user-123',
          false,
        );
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal(`${modelName} not found with id content-999`);
      }
      repoStub.update.should.not.have.been.called;
    });

    it('should throw when user not authorized to update', async () => {
      repoStub.findById.resolves({ ...mockContent, user: 'other-user' });

      try {
        await commonActions.updateContent(
          'content-1',
          { name: 'Updated' } as Partial<ICategory>,
          'user-123',
          false,
        );
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.include('not allowed to update');
      }
      repoStub.update.should.not.have.been.called;
    });

    it('should allow admin to update any content', async () => {
      repoStub.findById.resolves({ ...mockContent, user: 'other-user' });
      repoStub.update.resolves({ ...mockContent, name: 'Updated' });

      const result = await commonActions.updateContent(
        'content-1',
        { name: 'Updated' } as Partial<ICategory>,
        'admin-1',
        true,
      );

      repoStub.update.should.have.been.calledOnce;
      chai.expect(result).to.not.be.null;
    });
  });

  describe('deleteContent', () => {
    it('should delete content successfully', async () => {
      repoStub.findById.resolves(mockContent);
      repoStub.findByIdAndDelete.resolves(mockContent);

      const result = await commonActions.deleteContent('content-1', 'user-123', false);

      repoStub.findById.should.have.been.calledWith('content-1');
      repoStub.findByIdAndDelete.should.have.been.calledWith('content-1');
      chai.expect(result).to.not.be.null;
      result!.should.deep.equal(mockContent);
    });

    it('should throw when content not found', async () => {
      repoStub.findById.resolves(null);

      try {
        await commonActions.deleteContent('content-999', 'user-123', false);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal(`${modelName} not found with id content-999`);
      }
      repoStub.findByIdAndDelete.should.not.have.been.called;
    });

    it('should throw when user not authorized to delete', async () => {
      repoStub.findById.resolves({ ...mockContent, user: 'other-user' });

      try {
        await commonActions.deleteContent('content-1', 'user-123', false);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.include('not allowed to delete');
      }
      repoStub.findByIdAndDelete.should.not.have.been.called;
    });

    it('should allow admin to delete any content', async () => {
      repoStub.findById.resolves({ ...mockContent, user: 'other-user' });
      repoStub.findByIdAndDelete.resolves(mockContent);

      const result = await commonActions.deleteContent('content-1', 'admin-1', true);

      repoStub.findByIdAndDelete.should.have.been.calledWith('content-1');
      chai.expect(result).to.not.be.null;
    });
  });

  describe('listContent', () => {
    it('should list content for user', async () => {
      const contentList = [mockContent];
      repoStub.listAll.resolves(contentList);

      const result = await commonActions.listContent('user-123');

      repoStub.listAll.should.have.been.calledOnceWith('user-123');
      result.should.deep.equal(contentList);
      result.should.have.lengthOf(1);
    });

    it('should return empty array when no content', async () => {
      repoStub.listAll.resolves([]);

      const result = await commonActions.listContent('user-123');

      result.should.be.an('array').that.is.empty;
    });
  });

  describe('getContent', () => {
    it('should get content when found and user authorized', async () => {
      repoStub.findById.resolves(mockContent);

      const result = await commonActions.getContent('content-1', 'user-123', false);

      repoStub.findById.should.have.been.calledWith('content-1');
      chai.expect(result).to.not.be.null;
      result!.should.deep.equal(mockContent);
    });

    it('should return null when content not found', async () => {
      repoStub.findById.resolves(null);

      const result = await commonActions.getContent('content-999', 'user-123', false);

      chai.expect(result).to.be.null;
    });

    it('should throw when user not authorized to get', async () => {
      repoStub.findById.resolves({ ...mockContent, user: 'other-user' });

      try {
        await commonActions.getContent('content-1', 'user-123', false);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.include('not allowed to get');
      }
    });

    it('should allow admin to get any content', async () => {
      repoStub.findById.resolves({ ...mockContent, user: 'other-user' });

      const result = await commonActions.getContent('content-1', 'admin-1', true);

      chai.expect(result).to.not.be.null;
      result!.should.deep.equal({ ...mockContent, user: 'other-user' });
    });
  });
});
