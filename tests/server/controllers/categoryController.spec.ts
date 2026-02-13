import { Response } from 'express';
import sinon from 'sinon';
import { should } from 'chai';
import { CategoryManager } from '../../../src/server/managers/categoryManager';
import { CategoryController } from '../../../src/server/controllers/categoryController';
import { RequestWithUser } from '../../../src/server/types';

type MockResponse = {
  status: sinon.SinonStub;
  send: sinon.SinonStub;
};

describe('CategoryController', () => {
  const dumbCategory = {
    id: '123',
    name: 'Test Category',
    user: '123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  let categoryManagerStub: sinon.SinonStubbedInstance<CategoryManager>;
  let categoryController: CategoryController;
  let response: MockResponse;

  beforeEach(() => {
    categoryManagerStub = sinon.createStubInstance(CategoryManager);
    categoryManagerStub.deleteCategory.resolves(dumbCategory);
    categoryController = new CategoryController(categoryManagerStub as unknown as CategoryManager);
    response = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
  });

  it('should not let a void user delete a category', async () => {
    const errorMessage = 'User not authenticated to delete Category';
    const request = {
      user: undefined,
      params: {
        id: '123',
      },
    };

    try {
      await categoryController.deleteContent(request as unknown as RequestWithUser, response as unknown as Response);
    } catch (error) {
      should().exist(error);

      response.status.should.have.been.calledOnce;
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledOnce;
      response.send.should.have.been.calledWith({ error: errorMessage });
    }
  });

  it('should not delete if no content id is provided', async () => {
    const errorMessage = 'Content id is required for deleting action';
    const request = {
      user: {
        id: '123',
      },
    };

    try {
      await categoryController.deleteContent(request as unknown as RequestWithUser, response as unknown as Response);
    } catch (error) {
      should().exist(error);

      response.status.should.have.been.calledOnce;
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledOnce;
      response.send.should.have.been.calledWith({ error: errorMessage });
    }

    (request as unknown as RequestWithUser).params = {
      id: '',
    };

    try {
      await categoryController.deleteContent(request as unknown as RequestWithUser, response as unknown as Response);
    } catch (error) {
      should().exist(error);

      response.status.should.have.been.calledTwice;
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledTwice;
      response.send.should.have.been.calledWith({ error: errorMessage });
    }
  });

  it('should call the category manager to delete the category', async () => {
    const request = {
      user: {
        id: '123',
      },
      params: {
        id: '123',
      },
    };

    try {
      await categoryController.deleteContent(request as unknown as RequestWithUser, response as unknown as Response);
    } catch (error) {
      should().fail((error as Error).message);
    }

    response.send.should.have.been.calledOnce;
    response.send.should.have.been.calledWith(dumbCategory);
  });

  it('should throw an error if the category manager throws an error', async () => {
    const errorMessage = 'Error deleting category';
    const request = {
      user: {
        id: '123',
      },
      params: {
        id: '123',
      },
    };

    categoryManagerStub.deleteCategory.rejects(new Error(errorMessage));

    try {
      await categoryController.deleteContent(request as unknown as RequestWithUser, response as unknown as Response);
    } catch (error) {
      should().exist(error);

      response.status.should.have.been.calledOnce;
    }
  });
});