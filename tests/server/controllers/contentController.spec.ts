import sinon from 'sinon';
import { Response } from 'express';
import { Types } from 'mongoose';
import { should } from 'chai';
import ContentController from '../../../src/server/controllers/contentController';
import ContentManager from '../../../src/server/managers/contentManager';
import { RequestWithUser } from '../../../src/server/types';

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

describe('Content Controller', () => {
  let managerStub: sinon.SinonStubbedInstance<ContentManager<any>>;
  let response: MockResponse;
  let request: MockRequest;
  let contentController: ContentController<any>;
  let model = {
    modelName: 'Test',
  };

  beforeEach(() => {
    managerStub = sinon.createStubInstance(ContentManager);
    contentController = new ContentController(managerStub as unknown as ContentManager<any>);
    // Stub the `modelName` property directly on the instance
    (managerStub as any).modelName = model.modelName;
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
  });

  describe('createContent', () => {
    it('should create a new content', async () => {
      const createdContent = { id: 1, ...request.body };
      managerStub.createContent.resolves(createdContent);

      try {
        await contentController.createContent(request as RequestWithUser, response as unknown as Response);

        managerStub.createContent.should.have.been.calledOnce;
        managerStub.createContent.should.have.been.calledWith(request.body);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith(createdContent);
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should handle errors', async () => {
      const error = new Error('Test Error');
      managerStub.createContent.rejects(error);

      try {
        await contentController.createContent(request as RequestWithUser, response as unknown as Response);

        managerStub.createContent.should.have.been.calledOnce;
        managerStub.createContent.should.have.been.calledWith(request.body);
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
      const updatedContent = { id: 1, ...request.body };
      managerStub.updateContent.resolves(updatedContent);

      try {
        await contentController.updateContent(request as RequestWithUser, response as unknown as Response);

        managerStub.updateContent.should.have.been.calledOnce;
        managerStub.updateContent.should.have.been.calledWith(
          request.params.id,
          request.body,
          request.user?.id,
          false,
        );
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith(updatedContent);
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should throw error if user is not authenticated', async () => {
      request.user = undefined;

      try {
        await contentController.updateContent(request as RequestWithUser, response as unknown as Response);

        managerStub.updateContent.should.not.have.been.called;
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(500);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: 'User not authenticated to update Test' });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should throw error if no information is provided', async () => {
      request.body = {};

      try {
        await contentController.updateContent(request as RequestWithUser, response as unknown as Response);

        managerStub.updateContent.should.not.have.been.called;
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
        await contentController.updateContent(request as RequestWithUser, response as unknown as Response);

        managerStub.updateContent.should.not.have.been.called;
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(500);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: `No information provided to update ${model.modelName}` });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should throw 500 error if can\'t update content', async () => {
      const errorMessage = `${model.modelName} does not exist with id ${request.params.id}`;
      managerStub.updateContent.rejects(new Error(errorMessage));

      try {
        await contentController.updateContent(request as RequestWithUser, response as unknown as Response);

        managerStub.updateContent.should.have.been.calledOnce;
        managerStub.updateContent.should.have.been.calledWith(
          request.params.id,
          request.body,
          request.user?.id,
          false,
        );
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(500);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: errorMessage });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should throw 403 error if user is not allowed to update content', async () => {
      const errorMessage = `User ${request.user?.id} is not allowed to update ${model.modelName} with id ${request.params.id}`;
      managerStub.updateContent.rejects(new Error(errorMessage));

      try {
        await contentController.updateContent(request as RequestWithUser, response as unknown as Response);

        managerStub.updateContent.should.have.been.calledOnce;
        managerStub.updateContent.should.have.been.calledWith(
          request.params.id,
          request.body,
          request.user?.id,
          false,
        );
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(403);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: errorMessage });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });
  });

  describe('deleteContent', () => {
    it('should delete a content', async () => {
      const deletedContent = { id: 1, ...request.body };
      managerStub.deleteContent.resolves(deletedContent);

      try {
        await contentController.deleteContent(request as RequestWithUser, response as unknown as Response);

        managerStub.deleteContent.should.have.been.calledOnce;
        managerStub.deleteContent.should.have.been.calledWith(
          request.params.id,
          request.user?.id,
          false,
        );
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith(deletedContent);
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should throw error if user is not authenticated', async () => {
      request.user = undefined;

      try {
        await contentController.deleteContent(request as RequestWithUser, response as unknown as Response);

        managerStub.deleteContent.should.not.have.been.called;
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(500);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: 'User not authenticated to delete Test' });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should throw 500 error if can\'t delete content', async () => {
      const errorMessage = `${model.modelName} does not exist with id ${request.params.id}`;
      managerStub.deleteContent.rejects(new Error(errorMessage));

      try {
        await contentController.deleteContent(request as RequestWithUser, response as unknown as Response);

        managerStub.deleteContent.should.have.been.calledOnce;
        managerStub.deleteContent.should.have.been.calledWith(
          request.params.id,
          request.user?.id,
          false,
        );
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(500);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: errorMessage });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should throw 403 error if user is not allowed to delete content', async () => {
      const errorMessage = `User ${request.user?.id} is not allowed to delete ${model.modelName} with id ${request.params.id}`;
      managerStub.deleteContent.rejects(new Error(errorMessage));

      try {
        await contentController.deleteContent(request as RequestWithUser, response as unknown as Response);

        managerStub.deleteContent.should.have.been.calledOnce;
        managerStub.deleteContent.should.have.been.calledWith(
          request.params.id,
          request.user?.id,
          false,
        );
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(403);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: errorMessage });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should throw 404 error if content does not exist', async () => {
      const errorMessage = 'Content id is required for deleting action';
      request.params.id = '';

      try {
        await contentController.deleteContent(request as RequestWithUser, response as unknown as Response);

        managerStub.deleteContent.should.not.have.been.called;
        response.status.should.have.been.calledOnce;
        response.status.should.have.been.calledWith(500);
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith({ error: errorMessage });
      } catch (error) {
        should().fail((error as Error).message);
      }
    });
  });

  describe('listContent', () => {
    it('should list content', async () => {
      const content = [request.body];
      managerStub.listContent.resolves(content);

      try {
        await contentController.listContent(request as RequestWithUser, response as unknown as Response);

        managerStub.listContent.should.have.been.calledOnce;
        managerStub.listContent.should.have.been.calledWith(
          request.user?.id,
        );
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith(content);
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should handle errors', async () => {
      const error = new Error('Test Error');
      managerStub.listContent.rejects(error);

      try {
        await contentController.listContent(request as RequestWithUser, response as unknown as Response);

        managerStub.listContent.should.have.been.calledOnce;
        managerStub.listContent.should.have.been.calledWith(
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
      managerStub.getContent.resolves(request.body);

      try {
        await contentController.getContent(request as RequestWithUser, response as unknown as Response);

        managerStub.getContent.should.have.been.calledOnce;
        managerStub.getContent.should.have.been.calledWith(
          request.params.id,
        );
        response.send.should.have.been.calledOnce;
        response.send.should.have.been.calledWith(request.body);
      } catch (error) {
        should().fail((error as Error).message);
      }
    });

    it('should handle errors', async () => {
      const error = new Error('Test Error');
      managerStub.getContent.rejects(error);

      try {
        await contentController.getContent(request as RequestWithUser, response as unknown as Response);

        managerStub.getContent.should.have.been.calledOnce;
        managerStub.getContent.should.have.been.calledWith(
          request.params.id,
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
