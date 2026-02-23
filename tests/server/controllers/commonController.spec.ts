import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Response } from 'express';
import CommonController from '../../../src/server/controllers/commonController';

chai.use(sinonChai);
chai.should();
import type { ICommonActions } from '../../../src/server/types';
import { RequestWithUser } from '../../../src/server/types';

type MockResponse = {
  send: sinon.SinonStub;
  status: sinon.SinonStub;
};

type MockRequest = {
  body?: Record<string, unknown>;
  params: Record<string, string>;
  user?: {
    id: string;
    role: 'admin' | 'user';
    email?: string;
  };
};

type TestContent = {
  id: string;
  user: string;
  name?: string;
};

describe('CommonController', () => {
  const controllerName = 'Test';
  const mockContent: TestContent = {
    id: 'content-123',
    user: 'user-123',
    name: 'Test Content',
  };

  let managerStub: sinon.SinonStubbedInstance<ICommonActions<TestContent>>;
  let errorHandlerStub: sinon.SinonStub;
  let controller: ReturnType<typeof CommonController<TestContent>>;
  let response: MockResponse;
  let request: MockRequest;

  beforeEach(() => {
    managerStub = {
      createContent: sinon.stub(),
      updateContent: sinon.stub(),
      deleteContent: sinon.stub(),
      listContent: sinon.stub(),
      getContent: sinon.stub(),
    } as sinon.SinonStubbedInstance<ICommonActions<TestContent>>;

    errorHandlerStub = sinon.stub().callsFake((error: Error, res: MockResponse) => {
      (res as unknown as Response).status(500);
      (res as unknown as Response).send({ error: error.message });
      return res as unknown as Response;
    });

    controller = CommonController<TestContent>(
      managerStub as ICommonActions<TestContent>,
      controllerName,
      errorHandlerStub,
    );

    response = {
      send: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis(),
    };

    request = {
      body: { name: 'Test', user: 'user-123' },
      params: { id: 'content-123' },
      user: {
        id: 'user-123',
        role: 'user',
        email: 'user@test.com',
      },
    };
  });

  describe('createContent', () => {
    it('should create content successfully', async () => {
      managerStub.createContent.resolves(mockContent);

      await controller.createContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.createContent.should.have.been.calledOnce;
      managerStub.createContent.should.have.been.calledWith(request.body);
      response.send.should.have.been.calledOnce;
      response.send.should.have.been.calledWith(mockContent);
    });

    it('should reject when user is not authenticated', async () => {
      request.user = undefined;

      await controller.createContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.createContent.should.not.have.been.called;
      errorHandlerStub.should.have.been.calledOnce;
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({
        error: `User not authenticated to create ${controllerName}`,
      });
    });

    it('should reject when payload is void', async () => {
      request.body = {};

      await controller.createContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.createContent.should.not.have.been.called;
      errorHandlerStub.should.have.been.calledOnce;
      response.send.should.have.been.calledWith({
        error: `No information provided to create ${controllerName}`,
      });
    });

    it('should handle manager errors', async () => {
      const error = new Error('Create failed');
      managerStub.createContent.rejects(error);

      await controller.createContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.createContent.should.have.been.calledOnce;
      errorHandlerStub.should.have.been.calledWith(error, response);
    });
  });

  describe('updateContent', () => {
    it('should update content successfully', async () => {
      managerStub.updateContent.resolves(mockContent);

      await controller.updateContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.updateContent.should.have.been.calledOnce;
      managerStub.updateContent.should.have.been.calledWith(
        request.params.id,
        request.body,
        request.user?.id,
        false,
      );
      response.send.should.have.been.calledOnce;
      response.send.should.have.been.calledWith(mockContent);
    });

    it('should pass isAdmin true when user is admin', async () => {
      request.user!.role = 'admin';
      managerStub.updateContent.resolves(mockContent);

      await controller.updateContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.updateContent.should.have.been.calledWith(
        request.params.id,
        request.body,
        request.user?.id,
        true,
      );
    });

    it('should reject when user is not authenticated', async () => {
      request.user = undefined;

      await controller.updateContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.updateContent.should.not.have.been.called;
      errorHandlerStub.should.have.been.calledOnce;
      response.send.should.have.been.calledWith({
        error: `User not authenticated to update ${controllerName}`,
      });
    });

    it('should reject when payload is void', async () => {
      request.body = {};

      await controller.updateContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.updateContent.should.not.have.been.called;
      errorHandlerStub.should.have.been.calledOnce;
      response.send.should.have.been.calledWith({
        error: `No information provided to update ${controllerName}`,
      });
    });

    it('should handle manager errors', async () => {
      const error = new Error('Update failed');
      managerStub.updateContent.rejects(error);

      await controller.updateContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      errorHandlerStub.should.have.been.calledWith(error, response);
    });
  });

  describe('deleteContent', () => {
    it('should delete content successfully', async () => {
      managerStub.deleteContent.resolves(mockContent);

      await controller.deleteContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.deleteContent.should.have.been.calledOnce;
      managerStub.deleteContent.should.have.been.calledWith(
        request.params.id,
        request.user?.id,
        false,
      );
      response.send.should.have.been.calledOnce;
      response.send.should.have.been.calledWith(mockContent);
    });

    it('should pass isAdmin true when user is admin', async () => {
      request.user!.role = 'admin';
      managerStub.deleteContent.resolves(mockContent);

      await controller.deleteContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.deleteContent.should.have.been.calledWith(
        request.params.id,
        request.user?.id,
        true,
      );
    });

    it('should reject when user is not authenticated', async () => {
      request.user = undefined;

      await controller.deleteContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.deleteContent.should.not.have.been.called;
      errorHandlerStub.should.have.been.calledOnce;
      response.send.should.have.been.calledWith({
        error: `User not authenticated to delete ${controllerName}`,
      });
    });

    it('should reject when content id is missing', async () => {
      request.params = {};

      await controller.deleteContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.deleteContent.should.not.have.been.called;
      errorHandlerStub.should.have.been.calledOnce;
      response.send.should.have.been.calledWith({
        error: 'Content id is required for deleting action',
      });
    });

    it('should reject when content id is empty', async () => {
      request.params = { id: '' };

      await controller.deleteContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.deleteContent.should.not.have.been.called;
      errorHandlerStub.should.have.been.calledOnce;
      response.send.should.have.been.calledWith({
        error: 'Content id is required for deleting action',
      });
    });

    it('should handle manager errors', async () => {
      const error = new Error('Delete failed');
      managerStub.deleteContent.rejects(error);

      await controller.deleteContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      errorHandlerStub.should.have.been.calledWith(error, response);
    });
  });

  describe('listContent', () => {
    it('should list content successfully', async () => {
      const contentList = [mockContent];
      managerStub.listContent.resolves(contentList);

      await controller.listContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.listContent.should.have.been.calledOnce;
      managerStub.listContent.should.have.been.calledWith(request.user?.id);
      response.send.should.have.been.calledOnce;
      response.send.should.have.been.calledWith(contentList);
    });

    it('should reject when user is not authenticated', async () => {
      request.user = undefined;

      await controller.listContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.listContent.should.not.have.been.called;
      errorHandlerStub.should.have.been.calledOnce;
      response.send.should.have.been.calledWith({
        error: `User not authenticated to list ${controllerName}`,
      });
    });

    it('should handle manager errors', async () => {
      const error = new Error('List failed');
      managerStub.listContent.rejects(error);

      await controller.listContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      errorHandlerStub.should.have.been.calledWith(error, response);
    });
  });

  describe('getContent', () => {
    it('should get content successfully', async () => {
      managerStub.getContent.resolves(mockContent);

      await controller.getContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.getContent.should.have.been.calledOnce;
      managerStub.getContent.should.have.been.calledWith(
        request.params.id,
        request.user?.id,
        false,
      );
      response.send.should.have.been.calledOnce;
      response.send.should.have.been.calledWith(mockContent);
    });

    it('should pass isAdmin true when user is admin', async () => {
      request.user!.role = 'admin';
      managerStub.getContent.resolves(mockContent);

      await controller.getContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.getContent.should.have.been.calledWith(
        request.params.id,
        request.user?.id,
        true,
      );
    });

    it('should reject when user is not authenticated', async () => {
      request.user = undefined;

      await controller.getContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.getContent.should.not.have.been.called;
      errorHandlerStub.should.have.been.calledOnce;
      response.send.should.have.been.calledWith({
        error: `User not authenticated to get ${controllerName}`,
      });
    });

    it('should reject when content id is missing', async () => {
      request.params = {};

      await controller.getContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.getContent.should.not.have.been.called;
      errorHandlerStub.should.have.been.calledOnce;
      response.send.should.have.been.calledWith({
        error: 'Content id is required for getting action',
      });
    });

    it('should reject when content id is empty', async () => {
      request.params = { id: '' };

      await controller.getContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.getContent.should.not.have.been.called;
      errorHandlerStub.should.have.been.calledOnce;
      response.send.should.have.been.calledWith({
        error: 'Content id is required for getting action',
      });
    });

    it('should handle manager errors', async () => {
      const error = new Error('Get failed');
      managerStub.getContent.rejects(error);

      await controller.getContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      errorHandlerStub.should.have.been.calledWith(error, response);
    });
  });

  describe('default error handler', () => {
    it('should use default handleError when no custom error handler is provided', async () => {
      const controllerWithDefaultHandler = CommonController<TestContent>(
        managerStub as ICommonActions<TestContent>,
        controllerName,
      );

      const error = new Error('Manager error');
      managerStub.createContent.rejects(error);

      await controllerWithDefaultHandler.createContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({ error: 'Manager error' });
    });
  });
});
