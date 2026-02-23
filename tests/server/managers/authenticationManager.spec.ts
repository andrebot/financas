import chai, { should } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';

chai.use(sinonChai);
chai.should();
import { Tokens, UserPayload } from '../../../src/server/types';
import {
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
  ISSUER,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET,
} from '../../../src/server/config/auth';
import { Types } from 'mongoose';

type MockUserObj = {
  email: string;
  firstName: string;
  lastName: string;
};

type MockUser = {
  _id: string;
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: 'admin' | 'user';
}

const bcryptMock = {
  genSaltSync: sinon.stub().returns('salt'),
  hashSync: sinon.stub().returns('hashedPassword'),
  compareSync: sinon.stub(),
};
const sendNotificationStub = sinon.stub();
const jwtSignStub = sinon.stub();
const jwtVerifyStub = sinon.stub();

const UserRepo = {
  findById: sinon.stub(),
  findByIdAndDelete: sinon.stub(),
  save: sinon.stub(),
  update: sinon.stub(),
  listAll: sinon.stub(),
  findByEmail: sinon.stub(),
}

const {
  createRefreshToken,
  createAccessToken,
  changePassword,
  refreshTokens,
  resetPassword,
  createToken,
  deleteUser,
  createUser,
  updateUser,
  listUsers,
  register,
  getUser,
  logout,
  login,
} = proxyquire('../../../src/server/managers/authenticationManager', {
  'jsonwebtoken': { sign: jwtSignStub, verify: jwtVerifyStub, '@global': true },
  'bcrypt': bcryptMock,
  '../resources/repositories/userRepo': { default: UserRepo },
  '../utils/notification': { default: sendNotificationStub },
});

describe('AuthenticationManager', function () {
  beforeEach(function() {
    bcryptMock.genSaltSync.resetHistory();
    bcryptMock.hashSync.resetHistory();
    bcryptMock.compareSync.reset();
    jwtSignStub.reset();
    UserRepo.save.reset();
    UserRepo.findById.reset();
    UserRepo.update.reset();
    UserRepo.listAll.reset();
    UserRepo.findByEmail.reset();
    UserRepo.findByIdAndDelete.reset();
  });

  it('createToken should be called with correct arguments', function() {
    const payload = { email: 'test@example.com' };
    const expiresIn = 3600;
    const secret = 'secretKey';

    jwtSignStub.returns('mocktoken');

    const token = createToken(payload, expiresIn, secret) as string;

    jwtSignStub.should.have.been.calledOnceWithExactly(payload, secret, { issuer: ISSUER, expiresIn });
    should().exist(token);
    token.should.be.a('string');
  });

  it('createAccessToken should create a token with correct payload and options', function() {
    const email = 'user@example.com';
    const role = 'admin';
    const firstName = 'John';
    const lastName = 'Doe';
    const id = '1';

    jwtSignStub.returns('mocktoken');

    const token = createAccessToken(email, role, firstName, lastName, id) as string;

    const expectedPayload = { email, role, firstName, lastName, id };
    jwtSignStub.should.have.been.calledOnce;
    jwtSignStub.firstCall.args[0].should.deep.equal(expectedPayload);
    jwtSignStub.firstCall.args[2].should.have.property('expiresIn', ACCESS_TOKEN_EXPIRATION);
    should().exist(token);
    token.should.be.a('string');
  });

  it('createRefreshToken should create a token with correct payload and options', function() {
    const email = 'user@example.com';
    const role = 'user';
    const firstName = 'John';
    const lastName = 'Doe';
    const id = '1';

    jwtSignStub.returns('mocktoken');

    const token = createRefreshToken(email, role, firstName, lastName, id);

    jwtSignStub.should.have.been.calledOnce;
    jwtSignStub.firstCall.args[0].should.deep.equal({ email, role, firstName, lastName, id });
    jwtSignStub.firstCall.args[2].should.have.property('expiresIn', REFRESH_TOKEN_EXPIRATION);
    should().exist(token);
    token.should.be.a('string');
  });

  describe('creating user', function() {
    it('should create a user with hashed password and save to database', async function() {
      const mockUser = {
        email: 'user@example.com',
        password: 'ValidPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        id: '1',
      };
  
      UserRepo.save.resolves(mockUser);
  
      const user = await createUser(
        mockUser.email,
        mockUser.password,
        mockUser.firstName,
        mockUser.lastName, 
        mockUser.role,
      );
  
      bcryptMock.genSaltSync.should.have.been.calledOnce;
      bcryptMock.hashSync.should.have.been.calledOnceWithExactly(mockUser.password, 'salt');
      UserRepo.save.should.have.been.calledOnce;
      UserRepo.save.firstCall.args[0].should.deep.equal({
        email: mockUser.email,
        password: 'hashedPassword',
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
      });
      should().exist(user);
      should().exist(user.email);
      should().exist(user.firstName);
      should().exist(user.lastName);
      should().exist(user.role);
    });

    it('should throw an error if password does not meet criteria', async function() {
      const email = 'user@example.com';
      const password = 'bad';
      const firstName = 'John';
      const lastName = 'Doe';
  
      try {
        await createUser(email, password, firstName, lastName);
        chai.assert.fail('Expected error was not thrown');
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.equal('Password does not follow the rules');
      }
    });

    it('should throw an error if the user already exists', async function() {
      const email = 'user@example.com';
      const password = 'Naru-chan88';
      const firstName = 'John';
      const lastName = 'Doe';
  
      UserRepo.save.throwsException('User already exists');
  
      try {
        await createUser(email, password, firstName, lastName);
        chai.assert.fail('Expected error was not thrown');
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('User already exists');
      }
    });
  });

  describe('updating user', function() {
    let user: MockUser;
    let newValues: MockUserObj;
    let userPayload: UserPayload

    beforeEach(function() {
      user = {
        _id: new Types.ObjectId().toHexString(),
        id: new Types.ObjectId().toHexString(),
        email: 'old@example.com',
        firstName: 'Old',
        lastName: 'User',
        role: 'admin',
      };
      newValues = {
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
      };
      userPayload = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'admin',
        id: user._id,
      }
      UserRepo.findById.withArgs('1').resolves(user);
    });

    it('should update user with all fields provided', async function() {
      UserRepo.update.resolves({ ...newValues, id: user.id ?? user._id, _id: user._id });
  
      const result = await updateUser(userPayload, '1', newValues);
  
      result.email.should.be.equal(newValues.email);
      result.firstName.should.be.equal(newValues.firstName);
      result.lastName.should.be.equal(newValues.lastName);
      UserRepo.update.should.have.been.calledOnce;
      UserRepo.findById.should.have.been.calledOnce;
    });

    it('should update user with only email field provided', async function() {
      UserRepo.update.resolves({ ...user, email: newValues.email });
  
      const result = await updateUser(userPayload, '1', { email: newValues.email });

      result.email.should.be.equal(newValues.email);
      result.firstName.should.be.equal('Old');
      result.lastName.should.be.equal('User');
      UserRepo.update.should.have.been.calledOnce;
      UserRepo.findById.should.have.been.calledOnce;
    });

    it('should update user with only firstName field provided', async function() {
      UserRepo.update.resolves({ ...user, firstName: newValues.firstName });
  
      const result = await updateUser(userPayload, '1', { firstName: newValues.firstName });

      result.firstName.should.be.equal(newValues.firstName);
      result.email.should.be.equal('old@example.com');
      result.lastName.should.be.equal('User');
      UserRepo.update.should.have.been.calledOnce;
      UserRepo.findById.should.have.been.calledOnce;
    });

    it('should update user with only lastName field provided', async function() {
      UserRepo.update.resolves({ ...user, lastName: newValues.lastName });
  
      const result = await updateUser(userPayload, '1', { lastName: newValues.lastName });

      result.lastName.should.be.equal(newValues.lastName);
      result.email.should.be.equal('old@example.com');
      result.firstName.should.be.equal('Old');
      UserRepo.update.should.have.been.calledOnce;
      UserRepo.findById.should.have.been.calledOnce;
    });

    it('should throw an error if empty was provided to be updated', async function() {    
      UserRepo.update.resolves(user);
  
      try {
        await updateUser(userPayload, '1', { });
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('No information provided to be updated');
      }
    });

    it('should throw an error if nothing was provided to be updated', async function() {    
      UserRepo.update.resolves(user);
  
      try {
        await updateUser(userPayload, '1');
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('No information provided to be updated');
      }
    });

    it('should throw an error if nothing was provided to be updated', async function() {    
      UserRepo.findById.withArgs('1').resolves(null);
  
      try {
        await updateUser(userPayload, '1', { firstName: 'test' });
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('User not found');
      }
    });

    it('should throw an error if the user trying to update is not an admin updating another user', async function() {
      userPayload.role = 'user';
      userPayload.email = 'another@email.com';

      try {
        await updateUser(userPayload, '1', { firstName: 'test' });
        chai.assert.fail('Should have thrown an error');
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('You do not have permission to update this user');
      }
    });
  });

  it('should list users', async function() {
    await listUsers();

    UserRepo.listAll.should.have.been.calledOnce;
  });

  it('should retrieve an user by id', async function() {
    const userId = '1';

    UserRepo.findById.resolves({ id: userId });

    const user = await getUser(userId);

    should().exist(user);
  });

  describe('deleting user', function() {
    it('should be able to delete an user', async function() {
      const userId = '1';

      UserRepo.findByIdAndDelete.resolves({ id: userId });

      const deletedUser = await deleteUser(userId);

      deletedUser.id.should.be.equal(userId);
      UserRepo.findByIdAndDelete.should.have.been.calledWith(userId);
    });

    it('should throw an error if the user is not found', async function() {
      UserRepo.findByIdAndDelete.resolves(null);

      try {
        await deleteUser('1');
        chai.assert.fail('Should have thrown an error');
      } catch (error) {
        (error as Error).message.should.contain('User not found');
      }
    });
  });

  describe('logging in', function() {
    it('should successfully login the user', async function() {
      const password = 'Meu-password23';
      const mockUser = {
        id: '1',
        email: 'old@example.com',
        firstName: 'Old',
        lastName: 'User',
        role: 'admin',
        password,
      };

      jwtSignStub.returns('mockToken');

      bcryptMock.compareSync.returns(true);
      UserRepo.findByEmail.resolves(mockUser);

      const tokens = await login(mockUser.email, mockUser.password);

      should().exist(tokens);
      should().exist(tokens.accessToken);
      should().exist(tokens.refreshToken);
      jwtSignStub.should.have.been.calledTwice;
      jwtSignStub.should.have.been.calledWith(
        { email: mockUser.email, role: mockUser.role, firstName: mockUser.firstName, lastName: mockUser.lastName, id: mockUser.id },
        REFRESH_TOKEN_SECRET,
        { issuer: ISSUER, expiresIn: REFRESH_TOKEN_EXPIRATION },
      );

      jwtSignStub.should.have.been.calledWith(
        { 
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
          id: mockUser.id,
        },
        ACCESS_TOKEN_SECRET,
        { issuer: ISSUER, expiresIn: ACCESS_TOKEN_EXPIRATION },
      );
    });

    it('should throw an error if the user is not found', async function() {
      const mockUser = {
        id: '1',
        email: 'old@example.com',
        firstName: 'Old',
        lastName: 'User',
        role: 'admin',
        password: 'nada',
      };

      UserRepo.findByEmail.resolves(null);

      try {
        await login(mockUser.email, mockUser.password);
      } catch (error) {
        (error as Error).message.should.contain('User not found');
        jwtSignStub.should.have.not.been.called;
      }
    });

    it('should thrown an error if the passwords do not match', async function() {
      const mockUser = {
        id: '1',
        email: 'old@example.com',
        firstName: 'Old',
        lastName: 'User',
        role: 'admin',
        password: 'nada',
      };
      
      UserRepo.findByEmail.returns(mockUser);

      try {
        await login(mockUser.email, 'errada');
      } catch (error) {
        (error as Error).message.should.contain('invalidUser');
        jwtSignStub.should.have.not.been.called;
      }
    });
  });

  describe('logging out', function() {
    it('should be able to logout', async function() {
      jwtVerifyStub.returns(true);

      const result = await logout('token');

      should().exist(result);
      result.should.be.true;
      jwtVerifyStub.should.have.been.calledOnce;
      jwtVerifyStub.should.have.been.calledWith('token', REFRESH_TOKEN_SECRET, { complete: true });
    });

    it('should thrown error if logining out with invalid token', async function() {
      jwtVerifyStub.throws(new Error('Verify false'));

      const result = await logout('token');

      should().exist(result);
      result.should.be.false;
    });
  });
  
  describe('refreshing tokens', function() {
    it('should return a new refresh and access token when token is valid', async function() {
      const accessToken = 'anotherTestToken';
      const cryptToken = 'mockToken';
      const user = { 
        email: 'test@gmail.com',
        firstName: 'test',
        lastName: 'user',
        role: 'admin',
        id: '1',
      };

      jwtVerifyStub.returns({ payload: { email: 'test@gmail.com' } });
      jwtSignStub.returns(accessToken);
      UserRepo.findByEmail.resolves(user);

      const tokens = await refreshTokens(cryptToken) as Tokens;

      should().exist(tokens);
      tokens.accessToken.should.exist;
      tokens.refreshToken.should.exist;
      tokens.accessToken.should.be.a('string');
      tokens.refreshToken.should.be.a('string');
    });

    it('should throw an error if token is invalid when refreshing tokens', async function() {
      const errorMessage = 'InvalidToken';

      jwtVerifyStub.throws(new Error(errorMessage))

      try {
        await refreshTokens('mockToken');
        chai.assert.fail('Should have thrown an error');
      } catch (error) {
        (error as Error).message.should.be.a('string');
        (error as Error).message.should.contain(errorMessage);
      }
    });

    it('should throw an error if user is not found when refreshing tokens', async function() {
      const token = { email: 'test@gmail.com' };
      jwtVerifyStub.returns(token);
      UserRepo.findByEmail.resolves(null);

      try {
        await refreshTokens('mockToken');
        chai.assert.fail('Should have thrown an error');
      } catch (error) {
        (error as Error).message.should.be.a('string');
        (error as Error).message.should.contain(`Token invalid since its from non-existent user: ${token.email}`);
      }
    });
  });
  
  describe('resetting password', function() {
    it('should reset the password and send a notification', async function() {
      const mockUser = {
        id: '1',
        email: 'old@example.com',
        firstName: 'Old',
        lastName: 'User',
        role: 'admin',
        password: 'oldPassword',
      };
      UserRepo.findByEmail.resolves(mockUser);
      UserRepo.update.resolves(mockUser);

      const result = await resetPassword(mockUser.email);

      should().exist(result);
      result.should.be.true;
      UserRepo.findByEmail.should.have.been.calledOnce;
      UserRepo.update.should.have.been.calledOnce;
      sendNotificationStub.should.have.been.calledOnce;
      sendNotificationStub.should.have.been.calledWith(mockUser.email, sinon.match.string);
    });

    it('should throw an error if the user is not found when resetting password', async function() {
      UserRepo.findByEmail.resolves(null);

      try {
        await resetPassword('test@gmail.com');

        chai.assert.fail('Should have thrown an error');
      } catch (error) {
        (error as Error).message.should.be.a('string');
        (error as Error).message.should.contain('Could not reset password. Try again later.')
      }
    });
  });
  
  describe('changing password', function() {
    it('should change the password', async function() {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user' as const,
        password: 'oldPassword',
      };

      bcryptMock.compareSync.returns(true);
      UserRepo.findByEmail.resolves(mockUser);
      UserRepo.update.resolves(mockUser);

      const result = await changePassword(mockUser.email, 'oldPassword', 'newPassword');

      should().exist(result);
      result.should.be.true;
      UserRepo.findByEmail.should.have.been.calledOnceWith(mockUser.email);
      UserRepo.update.should.have.been.calledOnce;
      bcryptMock.compareSync.should.have.been.calledOnceWith('oldPassword', 'oldPassword');
      bcryptMock.genSaltSync.should.have.been.calledOnce;
      bcryptMock.hashSync.should.have.been.calledOnce;
    });

    it('should throw error if the old password does not match', async function() {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user' as const,
        password: 'anotherPassword',
      };

      bcryptMock.compareSync.returns(false);
      UserRepo.findByEmail.resolves(mockUser);

      try {
        await changePassword(mockUser.email, 'oldPassword', 'newPassword');

        chai.assert.fail('Should have thrown an error');
      } catch (error) {
        UserRepo.findByEmail.should.have.been.calledOnceWith(mockUser.email);
        bcryptMock.compareSync.should.have.been.calledOnceWith('oldPassword', 'anotherPassword');
        bcryptMock.genSaltSync.should.not.have.been.called;
        bcryptMock.hashSync.should.not.have.been.called;
        UserRepo.update.should.not.have.been.called;
        (error as Error).message.should.contain('Invalid Password');
      }
    });

    it('should throw error if the user is not found', async function() {
      const email = 'nonexistent@example.com';
      UserRepo.findByEmail.resolves(null);

      try {
        await changePassword(email, 'oldPassword', 'newPassword');

        chai.assert.fail('Should have thrown an error');
      } catch (error) {
        UserRepo.findByEmail.should.have.been.calledOnceWith(email);
        bcryptMock.compareSync.should.not.have.been.called;
        bcryptMock.genSaltSync.should.not.have.been.called;
        bcryptMock.hashSync.should.not.have.been.called;
        (error as Error).message.should.contain(`No user was found with email: ${email}`);
      }
    });
  });
  
  describe('registering user', function() {
    it('should be able to register an user', async function() {
      const mockUser = {
        email: 'test@gmail.com',
        firstName: 'test',
        lastName: 'user',
        role: 'user',
        id: '1',
        password: 'Naru-chan88',
      };

      jwtSignStub.returns('token');

      UserRepo.save.resolves(mockUser);

      const result = await register(mockUser.email, mockUser.password, mockUser.firstName, mockUser.lastName);

      should().exist(result);
      result.user.should.exist;
      result.tokens.should.exist;
      result.user.email.should.be.equal(mockUser.email);
      result.user.firstName.should.be.equal(mockUser.firstName);
      result.user.lastName.should.be.equal(mockUser.lastName);
      result.tokens.accessToken.should.be.a('string');
      result.tokens.refreshToken.should.be.a('string');
    });

    it('should throw an error if the user is not created', async function() {
      const mockUser = {
        email: 'test@gmail.com',
        firstName: 'test',
        lastName: 'user',
        role: 'user',
        id: '1',
        password: 'Naru-chan88',
      };

      UserRepo.save.rejects(new Error('Test error'));

      try {
        await register(mockUser.email, mockUser.password, mockUser.firstName, mockUser.lastName);
        chai.assert.fail('Should have thrown an error');
      } catch (error) {
        (error as Error).message.should.contain('Test error');
      }
    });
  });
});