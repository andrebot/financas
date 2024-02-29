import authRouter from '../../../src/server/routes/authentication';

describe('Authentication routes', () => {
  let router: any;

  beforeEach(() => {
    router = authRouter.router;
  });

  it('should have the correct URL prefix', () => {
    authRouter.urlPrefix.should.be.a('string');
    authRouter.urlPrefix.should.not.be.empty;
    authRouter.urlPrefix.should.equal('user');
  });

  it('should have the correct routes', () => {
    const routes = [
      { method: 'post', path: '/' },
      { method: 'get', path: '/' },
      { method: 'post', path: '/login' },
      { method: 'post', path: '/logout' },
      { method: 'post', path: '/refresh-tokens' },
      { method: 'put', path: '/:userId' },
      { method: 'get', path: '/:userId' },
      { method: 'delete', path: '/:userId' },
      { method: 'post', path: '/reset-password' },
      { method: 'post', path: '/change-password' },
    ];

    routes.forEach((route) => {
      const foundRoute = router.stack.find((s: any) => s.route.path === route.path && s.route.methods[route.method]);
      foundRoute.should.not.be.undefined;;
    });
  });
});
