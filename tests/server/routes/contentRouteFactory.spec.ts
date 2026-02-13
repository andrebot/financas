import sinon from 'sinon';
import { Router } from 'express';
import contentRouteFactory, { standardRouteFactory } from  '../../../src/server/routes/contentRouteFactory';
import type { IContentController } from '../../../src/server/types';
import { Model, Document } from 'mongoose';
import ContentController from '../../../src/server/controllers/contentController';
import Repository from '../../../src/server/resources/repositories/repository';
import ContentManager, { Content } from '../../../src/server/managers/contentManager';

type TestContent = Content & { name: string };

type TestController = {
  prefix: string;
  controller: IContentController;
};

describe(('contentRouteFactory'), () => {
  describe('Default factory', () => {
    let newRouter: Router;
    const testController = {
      listContent: sinon.spy(),
      createContent: sinon.spy(),
      getContent: sinon.spy(),
      updateContent: sinon.spy(),
      deleteContent: sinon.spy(),
    };

    beforeEach(() => {
      newRouter = contentRouteFactory(testController);
      testController.listContent.resetHistory();
      testController.createContent.resetHistory();
      testController.getContent.resetHistory();
      testController.updateContent.resetHistory();
      testController.deleteContent.resetHistory();
    });

    it('should return a router with the correct routes', () => {
      newRouter.stack.should.be.an('array');
      newRouter.stack.should.have.lengthOf(5);
      newRouter.stack[0].route?.path.should.equal('/');
      newRouter.stack[1].route?.path.should.equal('/');
      newRouter.stack[2].route?.path.should.equal('/:id([0-9a-fA-F]{24})');
      newRouter.stack[3].route?.path.should.equal('/:id([0-9a-fA-F]{24})');
      newRouter.stack[4].route?.path.should.equal('/:id([0-9a-fA-F]{24})');
    });

    it('should return a router with the correct middleware', () => {
      newRouter.stack.forEach((layer: any) => {
        layer.route.stack.should.have.lengthOf(2);
        layer.route.stack[0].handle.name.should.equal('accessTokenValidator');
      });
    });

    it('should be able to override one route', async () => {
      const overrideListContent = sinon.spy();
      const newRouter = contentRouteFactory(testController, {
        listContent: overrideListContent,
      });

      const listRoute = newRouter.stack[0];
      const routeHandler = listRoute.route!.stack[1].handle;

      const mockReq = { user: { id: 'test' } } as any;
      const mockRes = { sendStatus: sinon.stub(), json: sinon.stub() } as any;
      const next = sinon.stub();

      await routeHandler(mockReq, mockRes, next);

      overrideListContent.should.have.been.calledOnce;
      testController.listContent.should.not.have.been.called;
    });

    it('should be able to override multiple routes', async () => {
      const overrideListContent = sinon.spy();
      const overrideCreateContent = sinon.spy();
      const overrideGetContent = sinon.spy();
      const overrideUpdateContent = sinon.spy();
      const overrideDeleteContent = sinon.spy();

      const newRouter = contentRouteFactory(testController, {
        listContent: overrideListContent,
        createContent: overrideCreateContent,
        getContent: overrideGetContent,
        updateContent: overrideUpdateContent,
        deleteContent: overrideDeleteContent,
      });

      for (const route of newRouter.stack) {
        const routeHandler = route.route!.stack[1].handle;
        const mockReq = { user: { id: 'test' } } as any;
        const mockRes = { sendStatus: sinon.stub(), json: sinon.stub() } as any;
        const next = sinon.stub();

        await routeHandler(mockReq, mockRes, next);
      }

      overrideListContent.should.have.been.calledOnce;
      testController.listContent.should.not.have.been.called;
      overrideCreateContent.should.have.been.calledOnce;
      testController.createContent.should.not.have.been.called;
      overrideGetContent.should.have.been.calledOnce;
      testController.getContent.should.not.have.been.called;
      overrideUpdateContent.should.have.been.calledOnce;
      testController.updateContent.should.not.have.been.called;
      overrideDeleteContent.should.have.been.calledOnce;
      testController.deleteContent.should.not.have.been.called;
    });
  });

  describe('Standard route factory', () => {
    const testModel = {
      modelName: 'test',
      aggregate: sinon.stub(),
      base: sinon.stub(),
      baseModelName: 'test',
      castObject: sinon.stub(),
      model: sinon.stub(),
      find: sinon.stub(),
      findById: sinon.stub(),
      findOne: sinon.stub(),
      create: sinon.stub(),
      updateOne: sinon.stub(),
      deleteOne: sinon.stub(),
    } as unknown as Model<Document>;

    const testController: TestController = {
      prefix: 'test',
      controller: {
        listContent: sinon.spy(),
        createContent: sinon.spy(),
        getContent: sinon.spy(),
        updateContent: sinon.spy(),
        deleteContent: sinon.spy(),
      },
    };

    it('should return a router and a urlPrefix with default values', () => {
      const newRouter = standardRouteFactory(testModel, testController.prefix);

      newRouter.should.be.an('object');
      newRouter.should.have.property('prefix');
      newRouter.should.have.property('controller');
      newRouter.prefix.should.equal(testController.prefix);
      newRouter.controller.should.be.instanceOf(ContentController);
    });

    it('should return a controller using custom repository and content manager', () => {
      const repository = new Repository<Document, TestContent>(testModel);
      const contentManager = new ContentManager<TestContent>(repository, 'test');

      const newRouter = standardRouteFactory<Document, TestContent>(testModel, testController.prefix, {
        repository,
        contentManager,
      });

      newRouter.should.be.an('object');
      newRouter.should.have.property('prefix');
      newRouter.should.have.property('controller');
      newRouter.controller.should.be.instanceOf(ContentController);
    });
  });
});