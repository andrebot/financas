import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { should } from 'chai';
import categoryRouter from '../../../src/server/routes/category';

describe('Category routes', () => {
  it('should have the correct routes', () => {
    const routes = [
      { method: 'get', path: '/' },
      { method: 'post', path: '/' },
      { method: 'get', path: '/:id([0-9a-fA-F]{24})' },
      { method: 'put', path: '/:id([0-9a-fA-F]{24})' },
      { method: 'delete', path: '/:id([0-9a-fA-F]{24})' },
    ];

    routes.forEach((route) => {
      const foundRoute = categoryRouter.stack.find((s: any) => s.route.path === route.path && s.route.methods[route.method]);
      should().exist(foundRoute);
    });
  });

  it('should override the delete route with CategoryController.deleteContent', () => {
    const contentRouteFactoryStub = sinon.stub().returns({});

    proxyquire('../../../src/server/routes/category', {
      './contentRouteFactory': {
        default: contentRouteFactoryStub,
      },
    });

    contentRouteFactoryStub.should.have.been.calledOnce;
    const [, overrides] = contentRouteFactoryStub.firstCall.args;
    overrides.should.have.property('deleteContent');
    overrides.deleteContent.should.be.a('function');
    Object.keys(overrides).should.deep.equal(['deleteContent']);
  });
});
