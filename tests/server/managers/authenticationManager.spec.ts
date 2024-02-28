import chai, { should } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { Tokens, UserPayload } from '../../../src/server/types';
import { addToken, deleteToken } from '../../../src/server/resources/tokenModel';
import {
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
  ISSUER,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET,
} from '../../../src/server/config/auth';

chai.should();

type MockUserObj = {
  email: string;
  firstName: string;
  lastName: string;
};

type MockUser = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  save: () => MockUser;
  toObject: () => MockUserObj;
}

const bcryptMock = {
  genSaltSync: sinon.stub().returns('salt'),
  hashSync: sinon.stub().returns('hashedPassword'),
  compareSync: sinon.stub(),
};
const sendNotificationStub = sinon.stub();
const saveStub = sinon.stub().resolves();
const findByIdStub = sinon.stub();
const findStub = sinon.stub();
const findOneStub = sinon.stub();
const findByIdAndDeleteStub = sinon.stub();
const toObjectStub = sinon.stub();
const jwtSignStub = sinon.stub();
const jwtVerifyStub = sinon.stub();

class UserModelM {
  static findById = findByIdStub;
  static find = findStub;
  static findByIdAndDelete = findByIdAndDeleteStub;
  static findOne = findOneStub;
  save = saveStub;
  toObject = toObjectStub;

  constructor(data: any) {
    Object.assign(this, data);
  }
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
  logout,
  login,
} = proxyquire('../../../src/server/managers/authenticationManager', {
  'jsonwebtoken': { sign: jwtSignStub, verify: jwtVerifyStub, '@global': true },
  'bcrypt': bcryptMock,
  '../resources/userModel': { default: UserModelM },
  '../utils/notification': { default: sendNotificationStub },
});

describe('AuthenticationManager', function () {
  beforeEach(function() {
    bcryptMock.genSaltSync.resetHistory();
    bcryptMock.hashSync.resetHistory();
    bcryptMock.compareSync.reset();
    saveStub.reset();
    toObjectStub.reset();
    jwtSignStub.reset();
    findByIdStub.reset();
    findByIdAndDeleteStub.reset();
    findOneStub.reset();
  });

  it('createToken should be called with correct arguments', function() {
    const payload = { email: 'test@example.com' };
    const expiresIn = '1h';
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

    jwtSignStub.returns('mocktoken');

    const token = createAccessToken(email, role, firstName, lastName) as string;

    const expectedPayload = { email, role, firstName, lastName };
    jwtSignStub.should.have.been.calledOnce;
    jwtSignStub.firstCall.args[0].should.deep.equal(expectedPayload);
    jwtSignStub.firstCall.args[2].should.have.property('expiresIn', ACCESS_TOKEN_EXPIRATION);
    should().exist(token);
    token.should.be.a('string');
  });

  it('createRefreshToken should create a token with correct payload and options', function() {
    const email = 'user@example.com';

    jwtSignStub.returns('mocktoken');

    const token = createRefreshToken(email);

    const expectedPayload = { email };
    jwtSignStub.should.have.been.calledOnce;
    jwtSignStub.firstCall.args[0].should.deep.equal(expectedPayload);
    jwtSignStub.firstCall.args[2].should.have.property('expiresIn', REFRESH_TOKEN_EXPIRATION);
    should().exist(token);
    token.should.be.a('string');
  });

  it('should create a user with hashed password and save to database', async function() {
    const mockUser = {
      email: 'user@example.com',
      password: 'ValidPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
    };

    toObjectStub.returns(mockUser);

    const user = await createUser(
      mockUser.email,
      mockUser.password,
      mockUser.firstName,
      mockUser.lastName, 
      mockUser.role,
    );

    bcryptMock.genSaltSync.should.have.been.calledOnce;
    bcryptMock.hashSync.should.have.been.calledOnceWithExactly(mockUser.password, 'salt');
    saveStub.should.have.been.calledOnce;
    toObjectStub.should.have.been.calledOnce;
    should().exist(user);
    should().exist(user.email);
    should().exist(user.password);
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

    saveStub.throwsException('User already exists');

    try {
      await createUser(email, password, firstName, lastName);
      chai.assert.fail('Expected error was not thrown');
    } catch (error) {
      (error as Error).should.be.an('error');
      (error as Error).message.should.contain('User already exists');
    }
  });

  describe('updating user', function() {
    let user: MockUser;
    let newValues: MockUserObj;
    let userPayload: UserPayload

    beforeEach(function() {
      user = {
        _id: '1',
        email: 'old@example.com',
        firstName: 'Old',
        lastName: 'User',
        save: saveStub,
        toObject: toObjectStub,
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
      }
      findByIdStub.withArgs('1').resolves(user);
      toObjectStub.reset();
    });

    it('should update user with all fields provided', async function() {    
      toObjectStub.returns(newValues);
  
      await updateUser(userPayload, '1', {
        email: newValues.email,
        firstName: newValues.firstName,
        lastName: newValues.lastName,
      });
  
      user.email.should.be.equal(newValues.email);
      user.firstName.should.be.equal(newValues.firstName);
      user.lastName.should.be.equal(newValues.lastName);
      saveStub.should.have.been.calledOnce;
      toObjectStub.should.have.been.calledOnce;
    });

    it('should update user with only email field provided', async function() {    
      toObjectStub.returns(user);
  
      await updateUser(userPayload, '1', { email: newValues.email });

      user.email.should.be.equal(newValues.email);
      user.firstName.should.be.equal('Old');
      user.lastName.should.be.equal('User');
      saveStub.should.have.been.calledOnce;
      toObjectStub.should.have.been.calledOnce;
    });

    it('should update user with only firstName field provided', async function() {    
      toObjectStub.returns(user);
  
      await updateUser(userPayload, '1', { firstName: newValues.firstName });

      user.firstName.should.be.equal(newValues.firstName);
      user.email.should.be.equal('old@example.com');
      user.lastName.should.be.equal('User');
      saveStub.should.have.been.calledOnce;
      toObjectStub.should.have.been.calledOnce;
    });

    it('should update user with only lastName field provided', async function() {    
      toObjectStub.returns(user);
  
      await updateUser(userPayload, '1', { lastName: newValues.lastName });

      user.lastName.should.be.equal(newValues.lastName);
      user.email.should.be.equal('old@example.com');
      user.firstName.should.be.equal('Old');
      saveStub.should.have.been.calledOnce;
      toObjectStub.should.have.been.calledOnce;
    });

    it('should throw an error if empty was provided to be updated', async function() {    
      toObjectStub.returns(user);
  
      try {
        await updateUser(userPayload, '1', { });
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('No information provided to be updated');
      }
    });

    it('should throw an error if nothing was provided to be updated', async function() {    
      toObjectStub.returns(user);
  
      try {
        await updateUser(userPayload, '1');
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('No information provided to be updated');
      }
    });

    it('should throw an error if nothing was provided to be updated', async function() {    
      toObjectStub.returns(user);
      findByIdStub.withArgs('1').resolves(null);
  
      try {
        await updateUser(userPayload, '1', { firstName: 'test' });
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('User not found');
      }
    });

    it('should throw an error if the user is not found', async function() {    
      toObjectStub.returns(user);
  
      try {
        await updateUser(userPayload, '1');
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('No information provided to be updated');
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

  it('should list users (we are not testing mongoose)', async function() {
    await listUsers({});
    await listUsers();

    findStub.should.have.been.calledTwice;
  });

  it('should be able to delete an user', async function() {
    const userId = '1';

    findByIdAndDeleteStub.resolves({ value: { _id: userId } });

    const deletedUser = await deleteUser(userId);

    deletedUser._id.should.be.equal(userId);
    findByIdAndDeleteStub.should.have.been.calledWith(userId);
  });

  it('should throw an error if the user is not found', async function() {
    findByIdAndDeleteStub.resolves(null);

    try {
      await deleteUser('1');
      chai.assert.fail('Should have thrown an error');
    } catch (error) {
      (error as Error).message.should.contain('User not found');
    }
  });

  it('should successfully login the user', async function() {
    const password = 'Meu-password23';
    const mockUser = {
      _id: '1',
      email: 'old@example.com',
      firstName: 'Old',
      lastName: 'User',
      role: 'admin',
      password,
    };

    jwtSignStub.returns('mockToken');

    bcryptMock.compareSync.returns(true);
    findOneStub.resolves(mockUser);

    const tokens = await login(mockUser.email, mockUser.password);

    should().exist(tokens);
    should().exist(tokens.accessToken);
    should().exist(tokens.refreshToken);
    jwtSignStub.should.have.been.calledTwice;
    jwtSignStub.should.have.been.calledWith(
      { email: mockUser.email },
      REFRESH_TOKEN_SECRET,
      { issuer: ISSUER, expiresIn: REFRESH_TOKEN_EXPIRATION },
    );

    jwtSignStub.should.have.been.calledWith(
      { 
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
      },
      ACCESS_TOKEN_SECRET,
      { issuer: ISSUER, expiresIn: ACCESS_TOKEN_EXPIRATION },
    );
  });

  it('should throw an error if the user is not found', async function() {
    const mockUser = {
      _id: '1',
      email: 'old@example.com',
      firstName: 'Old',
      lastName: 'User',
      role: 'admin',
      password: 'nada',
    };

    findOneStub.resolves(null);

    try {
      await login(mockUser.email, mockUser.password);
    } catch (error) {
      (error as Error).message.should.contain('User not found');
      jwtSignStub.should.have.not.been.called;
    }
  });

  it('should thrown an error if the passwords do not match', async function() {
    const mockUser = {
      _id: '1',
      email: 'old@example.com',
      firstName: 'Old',
      lastName: 'User',
      role: 'admin',
      password: 'nada',
    };
    
    findOneStub.returns(mockUser);

    try {
      await login(mockUser.email, 'errada');
    } catch (error) {
      (error as Error).message.should.contain('Password was not a match');
      jwtSignStub.should.have.not.been.called;
    }
  });

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

  it('should return a new refresh and access token when token is valid', async function() {
    const accessToken = 'anotherTestToken';
    const cryptToken = 'mockToken';
    const user = { 
      email: 'test@gmail.com',
      firstName: 'test',
      lastName: 'user',
      role: 'admin',
    };

    jwtVerifyStub.returns({ payload: { email: 'test@gmail.com' } });
    jwtSignStub.returns(accessToken);
    findOneStub.resolves(user);
    addToken(cryptToken);

    const tokens = await refreshTokens(cryptToken) as Tokens;

    should().exist(tokens);
    tokens.accessToken.should.exist;
    tokens.refreshToken.should.exist;
    tokens.accessToken.should.be.a('string');
    tokens.refreshToken.should.be.a('string');

    deleteToken(cryptToken);
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
    findOneStub.resolves(null);

    try {
      await refreshTokens('mockToken');
      chai.assert.fail('Should have thrown an error');
    } catch (error) {
      (error as Error).message.should.be.a('string');
      (error as Error).message.should.contain(`No user was found with email: ${token.email}`);
    }
  });

  it('should throw an error if token is not in whitelist', async function() {
    const token = { payload: { email: 'test@gmail.com' } };
    const cryptToken = 'notValid';

    jwtVerifyStub.returns(token);
    addToken(cryptToken);

    try {
      await refreshTokens(cryptToken);
      chai.assert.fail('Should have thrown an error');
    } catch (error) {
      (error as Error).message.should.be.a('string');
      (error as Error).message.should.contain('Token is not valid');
    }

    deleteToken(cryptToken);
  });

  it('should reset the password and send a notification', async function() {
    const mockUser = {
      _id: '1',
      email: 'old@example.com',
      firstName: 'Old',
      lastName: 'User',
      role: 'admin',
      save: sinon.stub().resolves(),
    };
    findOneStub.resolves(mockUser);

    try {
      const result = await resetPassword(mockUser.email);

      should().exist(result);
      result.should.be.true;
      mockUser.save.should.have.been.calledOnce;
      sendNotificationStub.should.have.been.calledOnce;
      sendNotificationStub.should.have.been.calledWith(mockUser.email, sinon.match.string);
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should throw an error if the user is not found when resetting password', async function() {
    findOneStub.resolves(null);

    try {
      await resetPassword('test@gmail.com');

      chai.assert.fail('Should have thrown an error');
    } catch (error) {
      (error as Error).message.should.be.a('string');
      (error as Error).message.should.contain('No user was found with email:')
    }
  });

  it('should change the password', async function() {
    const mockUser = {
      password: 'oldPassword',
      save: sinon.stub().resolves(),
    };

    bcryptMock.compareSync.returns(true);
    UserModelM.findOne.returns(mockUser);

    try {
      const result = await changePassword('1', 'oldPassword', 'newPassword');

      should().exist(result);
      result.should.be.true;
      UserModelM.findOne.should.have.been.calledOnce;
      bcryptMock.compareSync.should.have.been.calledOnce;
      bcryptMock.compareSync.should.have.been.calledWith('oldPassword', 'oldPassword');
      bcryptMock.genSaltSync.should.have.been.calledOnce;
      bcryptMock.hashSync.should.have.been.calledOnce;
      mockUser.save.should.have.been.calledOnce;
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should return false if the old password does not match', async function() {
    const mockUser = {
      password: 'anotherPassword',
      save: sinon.stub().resolves(),
    };

    bcryptMock.compareSync.returns(false);
    UserModelM.findOne.returns(mockUser);

    try {
      const result = await changePassword('1', 'oldPassword', 'newPassword');

      should().exist(result);
      result.should.be.false;
      UserModelM.findOne.should.have.been.calledOnce;
      bcryptMock.compareSync.should.have.been.calledOnce;
      bcryptMock.compareSync.should.have.been.calledWith('oldPassword', 'anotherPassword');
      bcryptMock.genSaltSync.should.have.not.been.called;
      bcryptMock.hashSync.should.have.not.been.called;
      mockUser.save.should.have.not.been.called;
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });

  it('should return false if the user is not found', async function() {
    UserModelM.findOne.returns(null);

    try {
      const result = await changePassword('1', 'oldPassword', 'newPassword');

      should().exist(result);
      result.should.be.false;
      UserModelM.findOne.should.have.been.calledOnce;
      bcryptMock.compareSync.should.have.not.been.called;
      bcryptMock.genSaltSync.should.have.not.been.called;
      bcryptMock.hashSync.should.have.not.been.called;
    } catch (error) {
      console.error(error);
      chai.assert.fail('Should not have thrown an error');
    }
  });
});