import accountRouter from '../../../src/server/routes/account';

describe('Account routes', () => {
  let router: any;

  beforeEach(() => {
    router = accountRouter.router;
  });

  it('should have the correct URL prefix', () => {
    accountRouter.urlPrefix.should.be.a('string');
    accountRouter.urlPrefix.should.not.be.empty;
    accountRouter.urlPrefix.should.equal('account');
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
