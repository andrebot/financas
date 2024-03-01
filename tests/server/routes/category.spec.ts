import categoryRouter from '../../../src/server/routes/category';

describe('Account routes', () => {
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
      { method: 'get', path: '/:id' },
      { method: 'put', path: '/:id' },
      { method: 'delete', path: '/:id' },
    ];

    routes.forEach((route) => {
      const foundRoute = router.stack.find((s: any) => s.route.path === route.path && s.route.methods[route.method]);
      foundRoute.should.not.be.undefined;;
    });
  });
});
