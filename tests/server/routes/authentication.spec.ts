import { should } from 'chai';
import authRouter from '../../../src/server/routes/authentication';

describe('Authentication routes', () => {
  it('should have the correct routes', () => {
    const routes = [
      { method: 'post', path: '/' },
      { method: 'get', path: '/' },
      { method: 'post', path: '/login' },
      { method: 'post', path: '/logout' },
      { method: 'get', path: '/refresh-tokens' },
      { method: 'put', path: '/:userId' },
      { method: 'get', path: '/:userId' },
      { method: 'delete', path: '/:userId' },
      { method: 'post', path: '/reset-password' },
      { method: 'post', path: '/change-password' },
    ];

    routes.forEach((route) => {
      const foundRoute = authRouter.stack.find((s: any) => s.route.path === route.path && s.route.methods[route.method]);
      should().exist(foundRoute);
    });
  });
});
