import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CommonActions from '../../../../src/server/managers/contentManager/commonActions';
import type { Content } from '../../../../src/server/types';

chai.use(sinonChai);
chai.should();

type TestContent = Content & {
  id?: number;
  name?: string;
};

const createRepoStub = () => ({
  save: sinon.stub(),
  findById: sinon.stub(),
  deleteById: sinon.stub(),
  update: sinon.stub(),
  listAll: sinon.stub(),
  modelName: 'Test',
});

describe('CommonActions', () => {
  const modelName = 'Test';
  let repoStub: ReturnType<typeof createRepoStub>;
  let commonActions: ReturnType<typeof CommonActions<TestContent, any>>;

  const mockContent: TestContent = {
    id: 1,
    userId: 1,
    name: 'Test Content',
  };

  beforeEach(() => {
    repoStub = createRepoStub();
    commonActions = CommonActions(repoStub as any, modelName);
  });

  describe('createContent', () => {
    it('should create content successfully', async () => {
      const { id: _id, ...content } = mockContent;
      repoStub.save.resolves({ ...content, id: 1 });

      const result = await commonActions.createContent(content as TestContent);

      repoStub.save.should.have.been.calledOnceWith(content);
      result.should.have.property('id', 1);
    });

    it('should throw when payload is void', async () => {
      try {
        await commonActions.createContent({} as TestContent);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal(
          `No information provided to create ${modelName}`,
        );
      }
      repoStub.save.should.not.have.been.called;
    });
  });

  describe('updateContent', () => {
    it('should update content successfully', async () => {
      repoStub.update.resolves({ ...mockContent, name: 'Updated' });

      const result = await commonActions.updateContent(1, { name: 'Updated' } as Partial<TestContent>);

      repoStub.update.should.have.been.calledWith(1, { name: 'Updated' });
      chai.expect(result).to.not.be.null;
      result!.should.have.property('name', 'Updated');
    });

    it('should throw when payload is void', async () => {
      try {
        await commonActions.updateContent(1, {} as Partial<TestContent>);
        chai.expect.fail('Should have thrown');
      } catch (error) {
        (error as Error).message.should.equal(
          `No information provided to update ${modelName}`,
        );
      }
      repoStub.update.should.not.have.been.called;
    });
  });

  describe('deleteContent', () => {
    it('should delete content successfully', async () => {
      repoStub.deleteById.resolves(mockContent);

      const result = await commonActions.deleteContent(1);

      repoStub.deleteById.should.have.been.calledOnceWith(1);
      chai.expect(result).to.not.be.null;
      result!.should.deep.equal(mockContent);
    });

    it('should return null when content is not found', async () => {
      repoStub.deleteById.resolves(null);

      const result = await commonActions.deleteContent(999);

      chai.expect(result).to.be.null;
    });
  });

  describe('listContent', () => {
    it('should list all content', async () => {
      const contentList = [mockContent];
      repoStub.listAll.resolves(contentList);

      const result = await commonActions.listContent();

      repoStub.listAll.should.have.been.calledOnce;
      result.should.deep.equal(contentList);
      result.should.have.lengthOf(1);
    });

    it('should return empty array when no content exists', async () => {
      repoStub.listAll.resolves([]);

      const result = await commonActions.listContent();

      result.should.be.an('array').that.is.empty;
    });
  });

  describe('getContent', () => {
    it('should return content when found', async () => {
      repoStub.findById.resolves(mockContent);

      const result = await commonActions.getContent(1);

      repoStub.findById.should.have.been.calledWith(1);
      chai.expect(result).to.not.be.null;
      result!.should.deep.equal(mockContent);
    });

    it('should return null when content is not found', async () => {
      repoStub.findById.resolves(null);

      const result = await commonActions.getContent(999);

      chai.expect(result).to.be.null;
    });
  });
});
