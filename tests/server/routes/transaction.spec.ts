import transactionRouter from '../../../src/server/routes/transaction';
import { should } from 'chai';
describe('Transaction routes', () => {
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
      const foundRoute = transactionRouter.stack.find((s: any) => s.route.path === route.path && s.route.methods[route.method]);
      should().exist(foundRoute);
    });
  });
});
