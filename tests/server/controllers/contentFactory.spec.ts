import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { Types } from 'mongoose';
import { should } from 'chai';

type MockResponse = {
  send: sinon.SinonStub;
  status: sinon.SinonStub;
};

type MockRequest = {
  body?: {
    [key: string]: unknown;
  };
  query: {
    [key: string]: string;
  };
  params: {
    [key: string]: string;
  },
  user?: {
    email: string;
    role: string;
    id: string;
  };
};

const contentManagetStub = {
  createContent: sinon.stub(),
  updateContent: sinon.stub(),
  deleteContent: sinon.stub(),
  listContent: sinon.stub(),
  getContent: sinon.stub(),
};

const {
  default: contentControllerFactory,
  IContentController,
} = proxyquire('../../../src/server/controllers/contentFactory', {
  '../managers/contentManager': contentManagetStub,
});

describe('Account Controller', () => {
  let response: MockResponse;
  let request: MockRequest;
  let contentController: typeof IContentController;
  let model = {
    modelName: 'Test',
  };

  beforeEach(() => {
    contentController = contentControllerFactory(model);
    response = {
      send: sinon.stub(),
      status: sinon.stub().returnsThis(),
    };
    request = {
      body: {
        name: 'Test Account',
        agency: '1234',
        accountNumber: '123456',
        currency: 'BRL',
        user: new Types.ObjectId().toHexString(),
        cards: [
          {
            number: '1234567890123456',
            expirationDate: '12/2020',
          },
        ],
      },
      params: {
        id: new Types.ObjectId().toHexString(),
      },
      query: {},
      user: {
        email: 'user@gmail.com',
        role: 'user',
        id: new Types.ObjectId().toHexString(),
      }
    };
    contentManagetStub.createContent.resetHistory();
    contentManagetStub.updateContent.resetHistory();
    contentManagetStub.deleteContent.resetHistory();
    contentManagetStub.listContent.resetHistory();
    contentManagetStub.getContent.resetHistory();
  });

  describe('createContent', () => {
    it('should create a new content', async () => {
      contentManagetStub.createContent.resolves(request.body);

      try {
        await contentController.createContent(request, response);

        contentManagetStub.createContent.should.have.been.calledOnce;
        contentManagetStub.createContent.should.have.been.calledWith(request.body, sinon.match.any);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith(request.body);
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should handle errors', async () => {
      const error = new Error('Test Error');
      contentManagetStub.createContent.rejects(error);

      try {
        await contentController.createContent(request, response);

        contentManagetStub.createContent.should.have.been.calledOnce;
        contentManagetStub.createContent.should.have.been.calledWith(request.body, sinon.match.any);
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(500);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: error.message });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });
  });

  describe('updateContent', () => {
    it('should update a content', async () => {
      contentManagetStub.updateContent.resolves(request.body);

      try {
        await contentController.updateContent(request, response);

        contentManagetStub.updateContent.should.have.been.calledOnce;
        contentManagetStub.updateContent.should.have.been.calledWith(
          request.params.id,
          request.body,
          model,
          request.user?.id,
          false,
        );
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith(request.body);
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should throw error if user is not authenticated', async () => {
      request.user = undefined;

      try {
        await contentController.updateContent(request, response);

        contentManagetStub.updateContent.should.not.have.been.called;
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(500);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: 'User not authenticated' });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should throw error if no information is provided', async () => {
      request.body = {};

      try {
        await contentController.updateContent(request, response);

        contentManagetStub.updateContent.should.not.have.been.called;
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(500);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: `No information provided to update ${model.modelName}` });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should throw error if information is not found', async () => {
      request.body = undefined;

      try {
        await contentController.updateContent(request, response);

        contentManagetStub.updateContent.should.not.have.been.called;
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(500);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: `No information provided to update ${model.modelName}` });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should throw 500 error if can\'t update content', async () => {
      contentManagetStub.updateContent.rejects(new Error(`${model.modelName} not found with id ${request.params.id}`));

      try {
        await contentController.updateContent(request, response);

        contentManagetStub.updateContent.should.have.been.calledOnce;
        contentManagetStub.updateContent.should.have.been.calledWith(
          request.params.id,
          request.body,
          model,
          request.user?.id,
          false,
        );
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(500);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: `${model.modelName} not found with id ${request.params.id}` });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should throw 403 error if user is not allowed to update content', async () => {
      contentManagetStub.updateContent.rejects(new Error(`User ${request.user?.id} is not allowed to update ${model.modelName} with id ${request.params.id}`));

      try {
        await contentController.updateContent(request, response);

        contentManagetStub.updateContent.should.have.been.calledOnce;
        contentManagetStub.updateContent.should.have.been.calledWith(
          request.params.id,
          request.body,
          model,
          request.user?.id,
          false,
        );
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(403);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: `User ${request.user?.id} is not allowed to update ${model.modelName} with id ${request.params.id}` });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });
  });

  describe('deleteContent', () => {
    it('should delete a content', async () => {
      contentManagetStub.deleteContent.resolves(request.body);

      try {
        await contentController.deleteContent(request, response);

        contentManagetStub.deleteContent.should.have.been.calledOnce;
        contentManagetStub.deleteContent.should.have.been.calledWith(
          request.params.id,
          model,
          request.user?.id,
          false,
        );
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith(request.body);
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should throw error if user is not authenticated', async () => {
      request.user = undefined;

      try {
        await contentController.deleteContent(request, response);

        contentManagetStub.deleteContent.should.not.have.been.called;
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(500);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: 'User not authenticated' });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should throw 500 error if can\'t delete content', async () => {
      contentManagetStub.deleteContent.rejects(new Error(`${model.modelName} not found with id ${request.params.id}`));

      try {
        await contentController.deleteContent(request, response);

        contentManagetStub.deleteContent.should.have.been.calledOnce;
        contentManagetStub.deleteContent.should.have.been.calledWith(
          request.params.id,
          model,
          request.user?.id,
          false,
        );
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(500);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: `${model.modelName} not found with id ${request.params.id}` });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should throw 403 error if user is not allowed to delete content', async () => {
      contentManagetStub.deleteContent.rejects(new Error(`User ${request.user?.id} is not allowed to delete ${model.modelName} with id ${request.params.id}`));

      try {
        await contentController.deleteContent(request, response);

        contentManagetStub.deleteContent.should.have.been.calledOnce;
        contentManagetStub.deleteContent.should.have.been.calledWith(
          request.params.id,
          model,
          request.user?.id,
          false,
        );
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(403);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: `User ${request.user?.id} is not allowed to delete ${model.modelName} with id ${request.params.id}` });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });
  });

  describe('listContent', () => {
    it('should list content', async () => {
      const content = [request.body];
      contentManagetStub.listContent.resolves(content);

      try {
        await contentController.listContent(request, response);

        contentManagetStub.listContent.should.have.been.calledOnce;
        contentManagetStub.listContent.should.have.been.calledWith(
          request.body,
          model,
          request.user?.id,
        );
        // response.send.should.have.been.calledOnce;
        // response.send.should.have.been.calledWith(content);
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should handle errors', async () => {
      const error = new Error('Test Error');
      contentManagetStub.listContent.rejects(error);

      try {
        await contentController.listContent(request, response);

        contentManagetStub.listContent.should.have.been.calledOnce;
        contentManagetStub.listContent.should.have.been.calledWith(
          request.body,
          model,
          request.user?.id,
        );
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(500);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: error.message });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });
  });

  describe('getContent', () => {
    it('should get content', async () => {
      contentManagetStub.getContent.resolves(request.body);

      try {
        await contentController.getContent(request, response);

        contentManagetStub.getContent.should.have.been.calledOnce;
        contentManagetStub.getContent.should.have.been.calledWith(
          request.params.id,
          model,
          request.user?.id,
        );
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith(request.body);
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should handle errors', async () => {
      const error = new Error('Test Error');
      contentManagetStub.getContent.rejects(error);

      try {
        await contentController.getContent(request, response);

        contentManagetStub.getContent.should.have.been.calledOnce;
        contentManagetStub.getContent.should.have.been.calledWith(
          request.params.id,
          model,
          request.user?.id,
        );
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(500);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: error.message });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });
  });
});