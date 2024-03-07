import transactionRouter from '../../../src/server/routes/transaction';

describe('Transaction routes', () => {
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
      { method: 'get', path: '/:id([0-9a-fA-F]{24})' },
      { method: 'put', path: '/:id([0-9a-fA-F]{24})' },
      { method: 'delete', path: '/:id([0-9a-fA-F]{24})' },
      { method: 'get', path: '/types' },
    ];

    routes.forEach((route) => {
      const foundRoute = router.stack.find((s: any) => s.route.path === route.path && s.route.methods[route.method]);
      foundRoute.should.not.be.undefined;
    });
  });
});
