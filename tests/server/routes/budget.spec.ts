import budgetRouter from '../../../src/server/routes/budget';

describe('Budget routes', () => {
  let router: any;

  beforeEach(() => {
    router = budgetRouter.router;
  });

  it('should have the correct URL prefix', () => {
    budgetRouter.urlPrefix.should.be.a('string');
    budgetRouter.urlPrefix.should.not.be.empty;
    budgetRouter.urlPrefix.should.equal('budget');
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
