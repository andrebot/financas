import sinon from 'sinon';
import { Model } from 'mongoose';
import { Router } from 'express';
import contentRouteFactory from  '../../../src/server/routes/contentRouteFactory';

type TestRouter = {
  urlPrefix: string;
  router: Router;
}

describe(('contentRouteFactory'), () => {
  let newRouter: TestRouter;
  const urlPrefix = 'test';
  const testController = {
    listContent: sinon.spy(),
    createContent: sinon.spy(),
    getContent: sinon.spy(),
    updateContent: sinon.spy(),
    deleteContent: sinon.spy(),
  };

  beforeEach(() => {
    newRouter = contentRouteFactory(testController, urlPrefix);
    testController.listContent.resetHistory();
    testController.createContent.resetHistory();
    testController.getContent.resetHistory();
    testController.updateContent.resetHistory();
    testController.deleteContent.resetHistory();
  });

  it('should return a router and a urlPrefix', () => {
    newRouter.should.be.an('object');
    newRouter.should.have.property('urlPrefix');
    newRouter.should.have.property('router');
    newRouter.urlPrefix.should.be.a('string');
    newRouter.urlPrefix.should.equal('test');
  });

  it('should return a router with the correct routes', () => {
    newRouter.router.stack.should.be.an('array');
    newRouter.router.stack.should.have.lengthOf(5);
    newRouter.router.stack[0].route?.path.should.equal('/');
    newRouter.router.stack[1].route?.path.should.equal('/');
    newRouter.router.stack[2].route?.path.should.equal('/:id([0-9a-fA-F]{24})');
    newRouter.router.stack[3].route?.path.should.equal('/:id([0-9a-fA-F]{24})');
    newRouter.router.stack[4].route?.path.should.equal('/:id([0-9a-fA-F]{24})');
  });

  it('should return a router with the correct middleware', () => {
    newRouter.router.stack.forEach((layer: any) => {
      layer.route.stack.should.have.lengthOf(2);
      layer.route.stack[0].handle.name.should.equal('tokenValidator');
    });
  });
});