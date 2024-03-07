import categoryRouter from '../../../src/server/routes/category';

describe('Category routes', () => {
  let router: any;

  beforeEach(() => {
    router = categoryRouter.router;
  });

  it('should have the correct URL prefix', () => {
    categoryRouter.urlPrefix.should.be.a('string');
    categoryRouter.urlPrefix.should.not.be.empty;
    categoryRouter.urlPrefix.should.equal('category');
  });

  it('should have the correct routes', () => {
    const routes = [
      { method: 'get', path: '/' },
      { method: 'post', path: '/' },
      { method: 'get', path: '/:id([0-9a-fA-F]{24})' },
      { method: 'put', path: '/:id([0-9a-fA-F]{24})' },
      { method: 'delete', path: '/:id([0-9a-fA-F]{24})' },
    ];

    routes.forEach((route) => {
      const foundRoute = router.stack.find((s: any) => s.route.path === route.path && s.route.methods[route.method]);
      foundRoute.should.not.be.undefined;
    });
  });
});
