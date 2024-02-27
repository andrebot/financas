import sinon from 'sinon';
import proxyquire from 'proxyquire';
import chai from 'chai';

type MockResponse = {
  send: sinon.SinonStub;
  status: sinon.SinonStub;
};

type MockRequest = {
  body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    refreshToken: string;
  };
  params: {
    id: string;
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
    };
    request = {
      body: {
        email: 'test@gmail.com',
        password: 'Malo-ban76',
        firstName: 'Test',
        lastName: 'User',
        refreshToken: 'refresh-token',
      },
      params: {
        id: '507f1f77bcf86cd799439011',
      },
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
        request.params.id,
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
      _id: request.params.id,
    };

    authManagerStub.listUsers.resolves([user]);

    try {
      await getUserController(request, response);

      response.send.should.have.been.calledOnce;
      response.send.should.have.been.calledWith(user);
      authManagerStub.listUsers.should.have.been.calledOnce;
      authManagerStub.listUsers.should.have.been.calledWith({ _id: request.params.id });
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
      response.send.should.have.been.calledWith({ message: `User deleted: id ${request.params.id}` });
      authManagerStub.deleteUser.should.have.been.calledOnce;
      authManagerStub.deleteUser.should.have.been.calledWith(request.params.id);
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
    request.params.id = 'invalid-id';

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
    try {
      await loginController(request, response);

      response.send.should.have.been.calledOnce;
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

    try {
      await loginController(request, response);

      response.status.should.have.been.calledWith(400);
      response.send.should.have.been.calledWith({ error: 'Invalid email or password' });
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
      response.send.should.have.been.calledWith({ error: 'Invalid email or password' });
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
      response.send.should.have.been.calledWith({ error: 'Invalid email or password' });
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to logout an user successfully', async () => {
    try {
      await logoutController(request, response);

      response.send.should.have.been.calledOnce;
      response.send.should.have.been.calledWith({ message: 'Logged out' });
      authManagerStub.logout.should.have.been.calledOnce;
      authManagerStub.logout.should.have.been.calledWith(request.body.refreshToken);
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should be able to handle an error when logging out an user', async () => {
    authManagerStub.logout.rejects(new Error('Test error'));

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
});
