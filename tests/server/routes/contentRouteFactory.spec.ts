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
  const testModel = {
    find: sinon.spy(),
    findById: sinon.spy(),
    findByIdAndDelete: sinon.spy(),
    findByIdAndUpdate: sinon.spy(),
    create: sinon.spy(),
  };

  beforeEach(() => {
    newRouter = contentRouteFactory(testModel as unknown as Model<any, any, any, any, any, any>, urlPrefix);
    testModel.find.resetHistory();
    testModel.findById.resetHistory();
    testModel.findByIdAndDelete.resetHistory();
    testModel.findByIdAndUpdate.resetHistory();
    testModel.create.resetHistory();
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
    newRouter.router.stack[0].route.path.should.equal('/');
    newRouter.router.stack[1].route.path.should.equal('/');
    newRouter.router.stack[2].route.path.should.equal('/:id');
    newRouter.router.stack[3].route.path.should.equal('/:id');
    newRouter.router.stack[4].route.path.should.equal('/:id');
  });

  it('should return a router with the correct middleware', () => {
    newRouter.router.stack.forEach((layer: any) => {
      layer.route.stack.should.have.lengthOf(2);
      layer.route.stack[0].handle.name.should.equal('tokenValidator');
    });
  });

  it('should return a router with the correct controller methods', () => {
    newRouter.router.stack[0].route.stack[1].handle.name.should.equal('listContent');
    newRouter.router.stack[1].route.stack[1].handle.name.should.equal('createContent');
    newRouter.router.stack[2].route.stack[1].handle.name.should.equal('getContent');
    newRouter.router.stack[3].route.stack[1].handle.name.should.equal('updateContent');
    newRouter.router.stack[4].route.stack[1].handle.name.should.equal('deleteContent');
  });
});