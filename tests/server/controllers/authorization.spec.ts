import sinon from 'sinon';
import proxyquire from 'proxyquire';
import chai from 'chai';
import { REFRESH_TOKEN_EXPIRATION_COOKIE, REFRESH_TOKEN_COOKIE_NAME } from '../../../src/server/config/auth';

type MockResponse = {
  send: sinon.SinonStub;
  status: sinon.SinonStub;
  cookie: sinon.SinonStub;
};

type MockRequest = {
  body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    refreshToken: string;
    oldPassword: string;
    newPassword: string;
  };
  cookies: Record<string, string>;
  params: {
    userId: string;
  };
  query: {
    [key: string]: string;
  };
  user?: {
    email: string;
    role: string;
  };
};

const authManagerStub = {
  createUser: sinon.stub().resolves(),
  updateUser: sinon.stub().resolves(),
  listUsers: sinon.stub().resolves(),
  deleteUser: sinon.stub().resolves(),
  login: sinon.stub().resolves(),
  logout: sinon.stub().resolves(),
  refreshTokens: sinon.stub().resolves(),
  resetPassword: sinon.stub().resolves(),
  changePassword: sinon.stub().resolves(),
  register: sinon.stub().resolves(),
};

const {
  createUserController,
  updateUserController,
  listUsersController,
  deleteUserController,
  loginController,
  logoutController,
  refreshTokensController,
  getUserController,
  resetPasswordController,
  changePasswordController,
  registerController,
} = proxyquire('../../../src/server/controllers/authorization', {
  '../managers/authenticationManager': authManagerStub,
});

describe('AuthorizationController', () => {
  let response: MockResponse;
  let request: MockRequest;

  beforeEach(() => {
    response = {
      send: sinon.stub(),
      status: sinon.stub().returnsThis(),
      cookie: sinon.stub(),
    };
    request = {
      body: {
        email: 'test@gmail.com',
        password: 'Malo-ban76',
        firstName: 'Test',
        lastName: 'User',
        refreshToken: 'refresh-token',
        oldPassword: 'Malo-ban76',
        newPassword: 'Malo-ban77',
      },
      params: {
        userId: '507f1f77bcf86cd799439011',
      },
      cookies: {},
      query: {},
      user: {
        email: 'test@gmail.com',
        role: 'admin',
      }
    };
    authManagerStub.createUser.resetHistory();
    authManagerStub.updateUser.resetHistory();
    authManagerStub.listUsers.resetHistory();
    authManagerStub.deleteUser.resetHistory();
    authManagerStub.login.resetHistory();
    authManagerStub.logout.resetHistory();
    authManagerStub.refreshTokens.resetHistory();
    authManagerStub.resetPassword.resetHistory();
    authManagerStub.changePassword.resetHistory();
    authManagerStub.register.resetHistory();
  });

  it('should be able to create an user successfully', async () => {
    try {
      const newUser = await createUserController(request, response);

      response.send.should.have.been.calledOnce;
      authManagerStub.createUser.should.have.been.calledOnce;
      authManagerStub.createUser.should.have.been.calledWith(
        request.body.email,
        request.body.password,
        request.body.firstName,
        request.body.lastName,
      );
    } catch (error) {
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to handle an error when creating an user', async () => {
    authManagerStub.createUser.rejects(new Error('Test error'));

    try {
      await createUserController(request, response);

      chai.assert.fail('Should have thrown an error');
    } catch (error) {
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({ error: 'Test error' });
    }
  });

  it('should be able to update an user successfully', async () => {
    try {
      await updateUserController(request, response);

      response.send.should.have.been.calledOnce;
      authManagerStub.updateUser.should.have.been.calledOnce;
      authManagerStub.updateUser.should.have.been.calledWith(
        request.user,
        request.params.userId,
        {
          email: request.body.email,
          firstName: request.body.firstName,
          lastName: request.body.lastName,
        },
      );
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to handle an error when updating an user', async () => {
    authManagerStub.updateUser.rejects(new Error('Test error'));

    try {
      await updateUserController(request, response);

      chai.assert.fail('Should have thrown an error');
    } catch (error) {
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({ error: 'Test error' });
    }
  });

  it('should be able to handle an error when updating an user without permission', async () => {
    authManagerStub.updateUser.rejects(new Error('You do not have permission to update this user'));

    try {
      await updateUserController(request, response);

      response.status.should.have.been.calledWith(403);
      response.send.should.have.been.calledOnce;
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to list users successfully', async () => {
    try {
      await listUsersController(request, response);

      response.send.should.have.been.calledOnce;
      authManagerStub.listUsers.should.have.been.calledOnce;
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to handle an error when listing users', async () => {
    authManagerStub.listUsers.rejects(new Error('Test error'));

    try {
      await listUsersController(request, response);

      chai.assert.fail('Should have thrown an error');
    } catch (error) {
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({ error: 'Test error' });
    }
  });

  it('should be able to retrieve a user successfully', async () => {
    const user = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@gmail.com',
      id: request.params.userId,
    };

    authManagerStub.listUsers.resolves([user]);

    try {
      await getUserController(request, response);

      response.send.should.have.been.calledOnce;
      response.send.should.have.been.calledWith(user);
      authManagerStub.listUsers.should.have.been.calledOnce;
      authManagerStub.listUsers.should.have.been.calledWith({ id: request.params.userId });
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to handle an error when retrieveing a user', async () => {
    authManagerStub.listUsers.rejects(new Error('Test error'));

    try {
      await getUserController(request, response);

      chai.assert.fail('Should have thrown an error');
    } catch (error) {
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({ error: 'Test error' });
    }
  });
  
  it('should be able to delete an user successfully', async () => {
    try {
      await deleteUserController(request, response);

      response.send.should.have.been.calledOnce;
      response.send.should.have.been.calledWith({ message: `User deleted: id ${request.params.userId}` });
      authManagerStub.deleteUser.should.have.been.calledOnce;
      authManagerStub.deleteUser.should.have.been.calledWith(request.params.userId);
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to handle an error when deleting an user', async () => {
    authManagerStub.deleteUser.rejects(new Error('Test error'));

    try {
      await deleteUserController(request, response);

      chai.assert.fail('Should have thrown an error');
    } catch (error) {
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({ error: 'Test error' });
    }
  });

  it('should be able to handle an invalid id when deleting an user', async () => {
    request.params.userId = 'invalid-id';

    try {
      await deleteUserController(request, response);

      response.status.should.have.been.calledWith(400);
      response.send.should.have.been.calledWith({ error: 'Invalid id' });
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to login an user successfully', async () => {
    authManagerStub.login.resolves({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        email: request.body.email,
      },
    });

    try {
      await loginController(request, response);

      response.send.should.have.been.calledOnce;
      response.cookie.should.have.been.calledOnce;
      response.cookie.should.have.been.calledWith('refreshToken', 'refresh-token', {
        httpOnly: false,
        secure: false,
        maxAge: REFRESH_TOKEN_EXPIRATION_COOKIE,
      });
      authManagerStub.login.should.have.been.calledOnce;
      authManagerStub.login.should.have.been.calledWith(request.body.email, request.body.password);
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to handle an error when logging in an user', async () => {
    authManagerStub.login.rejects(new Error('Test error'));

    try {
      await loginController(request, response);

      chai.assert.fail('Should have thrown an error');
    } catch (error) {
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({ error: 'Test error' });
    }
  });

  it('should be able to handle an invalid email when logging in an user', async () => {
    request.body.email = 'invalid-email';
    request.body.password = 'Malo-ban76';

    try {
      await loginController(request, response);

      response.status.should.have.been.calledWith(400);
      response.send.should.have.been.calledWith({ error: 'invalidUser' });
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to handle an invalid password when logging in an user', async () => {
    request.body.password = '';

    try {
      await loginController(request, response);

      response.status.should.have.been.calledWith(400);
      response.send.should.have.been.calledWith({ error: 'invalidUser' });
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to handle an empty email when logging in an user', async () => {
    request.body.email = '';

    try {
      await loginController(request, response);

      response.status.should.have.been.calledWith(400);
      response.send.should.have.been.calledWith({ error: 'invalidUser' });
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to logout an user successfully', async () => {
    request.cookies = {
      [REFRESH_TOKEN_COOKIE_NAME]: 'refresh-token',
    };

    try {
      await logoutController(request, response);

      response.send.should.have.been.calledOnce;
      response.send.should.have.been.calledWith({ message: 'Logged out' });
      authManagerStub.logout.should.have.been.calledOnce;
      authManagerStub.logout.should.have.been.calledWith(request.cookies[REFRESH_TOKEN_COOKIE_NAME]);
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to handle an error when logging out an user', async () => {
    authManagerStub.logout.rejects(new Error('Test error'));
    request.cookies = {
      [REFRESH_TOKEN_COOKIE_NAME]: 'refresh-token',
    };

    try {
      await logoutController(request, response);

      chai.assert.fail('Should have thrown an error');
    } catch (error) {
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({ error: 'Test error' });
    }
  });

  it('should be able to handle an empty refresh token when logging out an user', async () => {
    request.body.refreshToken = '';

    try {
      await logoutController(request, response);

      response.status.should.have.been.calledWith(400);
      response.send.should.have.been.calledWith({ error: 'Empty refresh token' });
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to refresh tokens successfully', async () => {
    request.cookies = {
      [REFRESH_TOKEN_COOKIE_NAME]: 'refresh-token',
    };

    try {
      await refreshTokensController(request, response);

      response.send.should.have.been.calledOnce;
      authManagerStub.refreshTokens.should.have.been.calledOnce;
      authManagerStub.refreshTokens.should.have.been.calledWith(request.body.refreshToken);
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to handle an error when refreshing tokens', async () => {
    authManagerStub.refreshTokens.rejects(new Error('Test error'));
    request.cookies = {
      [REFRESH_TOKEN_COOKIE_NAME]: 'refresh-token',
    };

    try {
      await refreshTokensController(request, response);

      chai.assert.fail('Should have thrown an error');
    } catch (error) {
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({ error: 'Test error' });
    }
  });

  it('should be able to handle an empty refresh token when refreshing tokens', async () => {
    request.body.refreshToken = '';

    try {
      await refreshTokensController(request, response);

      response.status.should.have.been.calledWith(400);
      response.send.should.have.been.calledWith({ error: 'Empty refresh token' });
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should throw 400 error if email is empty while reseting passowrd of a user', async () => {
    request.body.email = '';

    try {
      await resetPasswordController(request, response);

      response.status.should.have.been.calledWith(400);
      response.send.should.have.been.calledWith({ error: 'Invalid email' });
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should throw 400 error if email is not valid while reseting passowrd of a user', async () => {
    request.body.email = 'invalid-email';

    try {
      await resetPasswordController(request, response);

      response.status.should.have.been.calledWith(400);
      response.send.should.have.been.calledWith({ error: 'Invalid email' });
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to reset password successfully', async () => {
    try {
      await resetPasswordController(request, response);

      response.send.should.have.been.calledOnce;
      authManagerStub.resetPassword.should.have.been.calledOnce;
      authManagerStub.resetPassword.should.have.been.calledWith(
        request.body.email,
      );
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to handle an error when reseting password', async () => {
    authManagerStub.resetPassword.rejects(new Error('Test error'));

    try {
      await resetPasswordController(request, response);

      chai.assert.fail('Should have thrown an error');
    } catch (error) {
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({ error: 'Test error' });
    }
  });

  it('should send 400 error if user is not valid while changing password', async () => {
    request.user = undefined;

    try {
      await changePasswordController(request, response);

      response.status.should.have.been.calledWith(400);
      response.send.should.have.been.calledWith({ error: 'Invalid user' });
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should send 400 error if no old password is provided', async () => {
    request.body.oldPassword = '';

    try {
      await changePasswordController(request, response);

      response.status.should.have.been.calledWith(400);
      response.send.should.have.been.calledWith({ error: 'Invalid password' });
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should send 400 error if no new password is provided', async () => {
    request.body.oldPassword = '';

    try {
      await changePasswordController(request, response);

      response.status.should.have.been.calledWith(400);
      response.send.should.have.been.calledWith({ error: 'Invalid password' });
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to change password successfully', async () => {
    try {
      await changePasswordController(request, response);

      response.send.should.have.been.calledOnce;
      authManagerStub.changePassword.should.have.been.calledOnce;
      authManagerStub.changePassword.should.have.been.calledWith(
        request.user?.email,
        request.body.oldPassword,
        request.body.newPassword,
      );
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to handle an error when changing password', async () => {
    authManagerStub.changePassword.rejects(new Error('Test error'));

    try {
      await changePasswordController(request, response);

      chai.assert.fail('Should have thrown an error');
    } catch (error) {
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({ error: 'Test error' });
    }
  });

  it('should be able to register an user successfully', async () => {
    authManagerStub.register.resolves({
      user: {
        email: request.body.email,
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        role: 'user',
        id: '123',
      },
      tokens: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    });

    try {
      await registerController(request, response);

      response.send.should.have.been.calledOnce;
      authManagerStub.register.should.have.been.calledOnce;
      authManagerStub.register.should.have.been.calledWith(request.body.email, request.body.password, request.body.firstName, request.body.lastName);
      response.cookie.should.have.been.calledOnce;
      response.cookie.should.have.been.calledWith('refreshToken', 'refresh-token', {
        httpOnly: true,
        secure: false,
        maxAge: REFRESH_TOKEN_EXPIRATION_COOKIE,
      });
      response.send.should.have.been.calledWith({
        user: {
          email: request.body.email,
          firstName: request.body.firstName,
          lastName: request.body.lastName,
          role: 'user',
          id: '123',
        },
        accessToken: 'access-token',
      });
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to handle an error when registering an user', async () => {
    authManagerStub.register.rejects(new Error('Test error'));

    try {
      await registerController(request, response);

      chai.assert.fail('Should have thrown an error');
    } catch (error) {
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({ error: 'Test error' });
    }
  });
});
