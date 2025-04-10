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