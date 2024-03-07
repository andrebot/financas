import goalRouter from '../../../src/server/routes/goal';

describe('Goal routes', () => {
  let router: any;

  beforeEach(() => {
    router = goalRouter.router;
  });

  it('should have the correct URL prefix', () => {
    goalRouter.urlPrefix.should.be.a('string');
    goalRouter.urlPrefix.should.not.be.empty;
    goalRouter.urlPrefix.should.equal('goal');
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
