import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Response } from 'express';
import GoalController from '../../../src/server/controllers/goalController';
import type { IGoalActions, RequestWithUser } from '../../../src/server/types';

chai.use(sinonChai);
chai.should();

type MockResponse = {
  send: sinon.SinonStub;
  status: sinon.SinonStub;
};

type MockRequest = {
  body?: Record<string, unknown>;
  params: Record<string, string>;
  query: Record<string, string>;
  user?: {
    id: string;
    role: 'admin' | 'user';
    email?: string;
  };
};

describe('GoalController', () => {
  let managerStub: sinon.SinonStubbedInstance<IGoalActions>;
  let controller: ReturnType<typeof GoalController>;
  let response: MockResponse;
  let request: MockRequest;

  beforeEach(() => {
    managerStub = {
      createContent: sinon.stub(),
      updateContent: sinon.stub(),
      deleteContent: sinon.stub(),
      listContent: sinon.stub(),
      getContent: sinon.stub(),
      listGoalsForMonth: sinon.stub(),
    } as sinon.SinonStubbedInstance<IGoalActions>;

    controller = GoalController(managerStub as IGoalActions);

    response = {
      send: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis(),
    };

    request = {
      body: { name: 'Test Goal', value: '1000' },
      params: { id: '1' },
      query: {},
      user: {
        id: 'user-123',
        role: 'user',
        email: 'user@test.com',
      },
    };
  });

  describe('listContent', () => {
    it('should list all goals when no year/month query params are provided', async () => {
      const goals = [{ id: 1, name: 'Goal 1' }];
      managerStub.listContent.resolves(goals as any);

      await controller.listContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.listContent.should.have.been.calledOnce;
      managerStub.listGoalsForMonth.should.not.have.been.called;
      response.send.should.have.been.calledWith(goals);
    });

    it('should list goals for a specific month when year and month are provided', async () => {
      request.query = { year: '2026', month: '6' };
      const goals = [{ id: 1, name: 'Goal 1', savedValue: '100' }];
      managerStub.listGoalsForMonth.resolves(goals as any);

      await controller.listContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.listGoalsForMonth.should.have.been.calledOnceWith(2026, 6);
      managerStub.listContent.should.not.have.been.called;
      response.send.should.have.been.calledWith(goals);
    });

    it('should reject when user is not authenticated', async () => {
      request.user = undefined;

      await controller.listContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.listContent.should.not.have.been.called;
      managerStub.listGoalsForMonth.should.not.have.been.called;
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({
        error: 'User not authenticated to list Goal',
      });
    });

    it('should handle manager errors from listContent', async () => {
      const error = new Error('List failed');
      managerStub.listContent.rejects(error);

      await controller.listContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({ error: error.message });
    });

    it('should handle manager errors from listGoalsForMonth', async () => {
      request.query = { year: '2026', month: '6' };
      const error = new Error('Month list failed');
      managerStub.listGoalsForMonth.rejects(error);

      await controller.listContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({ error: error.message });
    });
  });

  describe('createContent', () => {
    it('should create a goal', async () => {
      const goal = { id: 1, name: 'Test Goal', value: '1000' };
      managerStub.createContent.resolves(goal as any);

      await controller.createContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.createContent.should.have.been.calledOnceWith(request.body);
      response.send.should.have.been.calledWith(goal);
    });
  });

  describe('updateContent', () => {
    it('should update a goal by id', async () => {
      const goal = { id: 1, name: 'Updated Goal' };
      managerStub.updateContent.resolves(goal as any);

      await controller.updateContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.updateContent.should.have.been.calledOnceWith(1, request.body);
      response.send.should.have.been.calledWith(goal);
    });
  });

  describe('deleteContent', () => {
    it('should delete a goal by id', async () => {
      const goal = { id: 1, name: 'Test Goal' };
      managerStub.deleteContent.resolves(goal as any);

      await controller.deleteContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.deleteContent.should.have.been.calledOnceWith(1);
      response.send.should.have.been.calledWith(goal);
    });
  });

  describe('getContent', () => {
    it('should retrieve a goal by id', async () => {
      const goal = { id: 1, name: 'Test Goal' };
      managerStub.getContent.resolves(goal as any);

      await controller.getContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.getContent.should.have.been.calledOnceWith(1);
      response.send.should.have.been.calledWith(goal);
    });
  });
});
