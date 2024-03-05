import transactionRouter from '../../../src/server/routes/transaction';

describe('Account routes', () => {
  let router: any;

  beforeEach(() => {
    router = transactionRouter.router;
  });

  it('should have the correct URL prefix', () => {
    transactionRouter.urlPrefix.should.be.a('string');
    transactionRouter.urlPrefix.should.not.be.empty;
    transactionRouter.urlPrefix.should.equal('transaction');
  });

  it('should have the correct routes', () => {
    const routes = [
      { method: 'get', path: '/' },
      { method: 'post', path: '/' },
      { method: 'get', path: '/:id' },
      { method: 'put', path: '/:id' },
      { method: 'delete', path: '/:id' },
      { method: 'get', path: '/types' },
    ];

    routes.forEach((route) => {
      const foundRoute = router.stack.find((s: any) => s.route.path === route.path && s.route.methods[route.method]);
      foundRoute.should.not.be.undefined;
    });
  });
});
