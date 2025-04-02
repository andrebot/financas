import chai from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import server from '../../src/server/server';
import { adminUser, userToDelete } from './connectDB';
import { createAccessToken, createRefreshToken } from '../../src/server/managers/authenticationManager';
import UserModel from '../../src/server/resources/models/userModel';
import { REFRESH_TOKEN_COOKIE_NAME } from '../../src/server/config/auth';
describe('Authentication', () => {
  let newUser = {
    id: '',
    email: 'test1@gmail.com',
    firstName: 'Test1',
    lastName: 'User1',
    password: 'Maka-jan32',
  };
  let loginTokens: { accessToken: string, refreshToken: string };

  describe('Listing Users - GET /api/v1/user', () => {
    it('should return a 401 error if the user is not authenticated', async () => {
      const response = await request(server)
        .get('/api/v1/user');

      response.status.should.be.eq(401);
    });

    it('should list users successfully if the user is authenticated', async () => {
      const token = createAccessToken(
        adminUser.email,
        'admin',
        adminUser.firstName,
        adminUser.lastName,
        adminUser.id!,
      );

      const response = await request(server)
        .get('/api/v1/user')
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(200);
      response.body.should.be.a('array');
      response.body.length.should.be.eql(2);
    });

    it('should return a 403 error if the user is authenticated but not an admin', async () => {
      const token = createAccessToken(
        adminUser.email,
        'user',
        adminUser.firstName,
        adminUser.lastName,
        adminUser.id!,
      );

      const response = await request(server)
        .get('/api/v1/user')
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(403);
    });

    it('should return a 500 error if an error occurs', async () => {
      const token = createAccessToken(
        adminUser.email,
        'admin',
        adminUser.firstName,
        adminUser.lastName,
        adminUser.id!,
      );
      const stub = sinon.stub(UserModel, 'find').throws();

      const response = await request(server)
        .get('/api/v1/user')
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('Error');

      stub.restore();
    });
  });

  describe('Creating Users - POST /api/v1/user', () => {
    let token: string;

    beforeEach(() => {
      token = createAccessToken(
        adminUser.email,
        'admin',
        adminUser.firstName,
        adminUser.lastName,
        adminUser.id!,
      );
    });

    it('should return a 401 error if the user is not authenticated', async () => {
      const response = await request(server)
        .post('/api/v1/user');

      response.status.should.be.eq(401);
    });

    it('should create a user successfully if the user is an admin', async () => {
      const response = await request(server)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser);

      response.status.should.be.eq(200);
      response.body.should.have.property('email').eql(newUser.email);
      response.body.should.have.property('firstName').eql(newUser.firstName);
      response.body.should.have.property('lastName').eql(newUser.lastName);
      response.body.should.have.property('role').eql('user');
      response.body.should.have.property('id');
      response.body.should.not.have.property('password');

      newUser.id = response.body.id;
    });

    it('should return a 403 error if the user is authenticated but not an admin', async () => {
      const token = createAccessToken(
        adminUser.email,
        'user',
        adminUser.firstName,
        adminUser.lastName,
        adminUser.id!,
      );

      const response = await request(server)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser);

      response.status.should.be.eq(403);
    });

    it('should return an error 500 if the user already exists', async () => {
      const newUser = {...adminUser, password: 'Maka-jan32'};

      const response = await request(server)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser);

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('duplicateUser');
    });

    it('should return error 500 if the password is not strong enough', async () => {
      const newUser = {...adminUser, password: 'password'};

      const response = await request(server)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser);

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('Password does not follow the rules');
    });

    it('should return error 500 if the email is not valid', async () => {
      const newUser = {...adminUser, email: 'test', password: 'Maka-jan32'};

      const response = await request(server)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser);

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('user validation failed: email: Path `email` is invalid (test).');
    });

    it('should return error 500 if firstName is missing', async () => {
      const newUser = {...adminUser, firstName: '', password: 'Maka-jan32'};

      const response = await request(server)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser);

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('user validation failed: firstName: Path `firstName` is required.');
    });

    it('should return error 500 if lastName is missing', async () => {
      const newUser = {...adminUser, lastName: '', password: 'Maka-jan32'};

      const response = await request(server)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser);

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('user validation failed: lastName: Path `lastName` is required.');
    });
  });

  describe('Updating Users - PUT /api/v1/user/:userId', () => {
    let token: string;

    beforeEach(() => {
      token = createAccessToken(
        newUser.email,
        'user',
        newUser.firstName,
        newUser.lastName,
        newUser.id!,
      );
    });

    it('should be able to update an user if the user is an admin', async () => {
      token = createAccessToken(
        adminUser.email,
        'admin',
        adminUser.firstName,
        adminUser.lastName,
        adminUser.id!,
      );
      adminUser.firstName.should.be.eql('Admin');

      const response = await request(server)
        .put(`/api/v1/user/${adminUser.id!}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Admin1' });

      response.status.should.be.eq(200);
      response.body.should.have.property('firstName').eql('Admin1');
    });

    it('should not be able to update a user if it is not the same user', async () => {
      token = createAccessToken(
        'another@gmail.com',
        'user',
        'nothing',
        'here',
        new Types.ObjectId().toHexString(),
      );

      const response = await request(server)
        .put(`/api/v1/user/${newUser.id!}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Test2' });

      response.status.should.be.eq(403);
      response.body.should.have.property('error').eql('You do not have permission to update this user');
    });

    it('should not be able to update password of an user if it is the same user', async () => {
      const response = await request(server)
        .put(`/api/v1/user/${newUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'Gero-jun23' });

      response.status.should.be.eq(500);
    });

    it('should not be able to update role of an user if it is the same user', async () => {
      const response = await request(server)
        .put(`/api/v1/user/${newUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'admin' });

      response.status.should.be.eq(500);
    });

    it('should be able to update firstName of an user if it is the same user', async () => {
      const response = await request(server)
        .put(`/api/v1/user/${newUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Test2' });

      response.status.should.be.eq(200);
      response.body.should.have.property('firstName').eql('Test2');
    });

    it('should be able to update lastName of an user if it is the same user', async () => {
      const response = await request(server)
        .put(`/api/v1/user/${newUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ lastName: 'bogabofa' });

      response.status.should.be.eq(200);
      response.body.should.have.property('lastName').eql('bogabofa');
    });

    it('should be able to update email of an user if it is the same user', async () => {
      const newEmail = 'new@email.com';

      const response = await request(server)
        .put(`/api/v1/user/${newUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: newEmail });

      response.status.should.be.eq(200);
      response.body.should.have.property('email').eql(newEmail);

      newUser.email = newEmail;
    });

    it('should be able to handle errors when finding the user to be updated', async () => {
      const stub = sinon.stub(UserModel, 'findById').throws();

      const response = await request(server)
        .put(`/api/v1/user/${newUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'nada@gmail.com' });

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('Error');

      stub.restore();
    });

    it('should throw an error if no user is found', async () => {
      const response = await request(server)
        .put(`/api/v1/user/34865234582734n523485n23487`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'nada@gmail.com' });

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('Cast to ObjectId failed for value "34865234582734n523485n23487" (type string) at path "_id" for model "user"');
    });
  });

  describe('Deleting Users - DELETE /api/v1/user/:userId', () => {
    let token: string;

    beforeEach(() => {
      token = createAccessToken(
        adminUser.email,
        'admin',
        adminUser.firstName,
        adminUser.lastName,
        adminUser.id!,
      );
    });

    it('shoud return a 401 error if the user is not an admin trying to delete another user', async () => {
      token = createAccessToken(
        newUser.email,
        'user',
        newUser.firstName,
        newUser.lastName,
        newUser.id!,
      );

      const response = await request(server)
        .delete(`/api/v1/user/${adminUser.id}`)
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(401);
    });

    it('should return a 401 error if the user is not authenticated', async () => {
      const response = await request(server)
        .delete(`/api/v1/user/${newUser.id}`);

      response.status.should.be.eq(401);
    });

    it('should not be able to delete a user if the id it not valid', async () => {
      const response = await request(server)
        .delete(`/api/v1/user/34865234582734n523485n23487`)
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(400);
      response.body.should.have.property('error').eql('Invalid id');
    });

    it('should be able to delete an user if it is an admin', async () => {
      const response = await request(server)
        .delete(`/api/v1/user/${newUser.id}`)
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(200);
      response.body.should.have.property('message').eql(`User deleted: id ${newUser.id}`);
    });

    it('should be able to delete a user if it is the same user that is not an admin', async () => {
      const toDeleteToken = createAccessToken(
        userToDelete.email,
        'user',
        userToDelete.firstName,
        userToDelete.lastName,
        userToDelete.id!,
      );

      const toDeleteRefreshToken = createRefreshToken(
        userToDelete.email,
        'user',
        userToDelete.firstName,
        userToDelete.lastName,
        userToDelete.id!,
      );

      const response = await request(server)
        .delete(`/api/v1/user/${userToDelete.id}`)
        .set('Authorization', `Bearer ${toDeleteToken}`)
        .set('Cookie', `${REFRESH_TOKEN_COOKIE_NAME}=${toDeleteRefreshToken}`);

      response.status.should.be.eq(200);
      response.body.should.have.property('message').eql(`User deleted: id ${userToDelete.id}`);
    });

    it('should return 404 if the user is not found', async () => {
      const response = await request(server)
        .delete(`/api/v1/user/${newUser.id}`)
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(404);
      response.body.should.have.property('error').eql(`User not found ${newUser.id}`);
    });

    it('should return error if an error occurs', async () => {
      const stub = sinon.stub(UserModel, 'findByIdAndDelete').throws();

      const response = await request(server)
        .delete(`/api/v1/user/${newUser.id}`)
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('Error');

      stub.restore();
    });
  });

  describe('Logging in - POST /api/v1/login', () => {
    it('should return a 404 error if the user is not found', async () => {
      const response = await request(server)
        .post('/api/v1/user/login')
        .send({ email: 'andre.almeida@gmail.com', password: 'Maka-jan32' });

      response.status.should.be.eq(404);
      response.body.should.have.property('error').eql('User not found');
    });

    it('should return a 400 error if the email is not valid', async () => {
      const response = await request(server)
        .post('/api/v1/user/login')
        .send({ email: 'andre.almeida', password: 'Maka-jan32' });

      response.status.should.be.eq(400);
      response.body.should.have.property('error').eql('invalidUser');
    });

    it('should return a 400 error if the email is empty', async () => {
      const response = await request(server)
        .post('/api/v1/user/login')
        .send({ password: 'Maka-jan32' });

      response.status.should.be.eq(400);
      response.body.should.have.property('error').eql('invalidUser');
    });

    it('should return a 400 error if the password is empty', async () => {
      const response = await request(server)
        .post('/api/v1/user/login')
        .send({ email: 'andre.almeida@gmail.com' });

      response.status.should.be.eq(400);
      response.body.should.have.property('error').eql('invalidUser');
    });

    it('should return a 400 error if the password is not a match', async () => {
      const response = await request(server)
        .post('/api/v1/user/login')
        .send({ email: adminUser.email, password: 'wrong password' });

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('invalidUser');
    });

    it('should return a 200 status and the tokens if the user is found', async () => {	
      const response = await request(server)	
        .post('/api/v1/user/login')	
        .send({ email: adminUser.email, password: 'adminPassword' });	

      response.status.should.be.eq(200);
      response.body.should.have.property('accessToken');
      response.body.should.have.property('user');
      response.headers.should.have.property('set-cookie');

      loginTokens = {
        accessToken: response.body.accessToken,
        refreshToken: response.headers['set-cookie'][0].split(';')[0].split('=')[1],
      };
    });
  });

  describe('Refreshing Tokens - POST /api/v1/user/refresh-tokens', () => {
    let refreshToken: string;
    let accessToken: string;

    beforeEach(() => {
      refreshToken = createRefreshToken(adminUser.email, 'admin', adminUser.firstName, adminUser.lastName, adminUser.id!);
      accessToken = createAccessToken(
        adminUser.email,
        'admin',
        adminUser.firstName,
        adminUser.lastName,
        adminUser.id!,
      );
    });

    it('should return a 400 error if the refreshToken is empty', async () => {
      const response = await request(server)
        .get('/api/v1/user/refresh-tokens')
        .send({ refreshToken: '' });

      response.status.should.be.eq(400);
      response.body.should.have.property('error').eql('Empty refresh token');
    });

    it('should be able to handle errors when verifying the token', async () => {
      const stub = sinon.stub(jwt, 'verify').throws();

      const response = await request(server)
        .get('/api/v1/user/refresh-tokens')
        .set('Cookie', `${REFRESH_TOKEN_COOKIE_NAME}=${loginTokens.refreshToken}`);

      response.status.should.be.eq(500);

      stub.restore();
    });

    it('should be able to refresh the tokens successfully if refreshToken is valid',  async () => {
      const stub = sinon.stub(jwt, 'verify').callsFake(() => ({ email: adminUser.email }));
      
      const response = await request(server)  
        .get('/api/v1/user/refresh-tokens')
        .set('Cookie', `${REFRESH_TOKEN_COOKIE_NAME}=${loginTokens.refreshToken}`);

      response.status.should.be.eq(200);
      response.body.should.have.property('accessToken');
      response.body.should.have.property('refreshToken');

      stub.restore();
    });

    it('should return 500 if cannot find the user', async () => {
      const badEmail = 'naotem@gmail.com';
      refreshToken = createRefreshToken(badEmail, 'admin', 'admin', 'admin', new Types.ObjectId().toHexString());

      const response = await request(server)
        .get('/api/v1/user/refresh-tokens')
        .set('Cookie', `${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}`);

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql(`Token invalid since its from non-existent user: ${badEmail}`);
    });

    it('should return 500 if finding the user throws an error', async () => {
      const stub = sinon.stub(UserModel, 'findOne').throws();

      const response = await request(server)
        .get('/api/v1/user/refresh-tokens')
        .set('Cookie', `${REFRESH_TOKEN_COOKIE_NAME}=${loginTokens.refreshToken}`);

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('Error');

      stub.restore();
    });
  });

  describe('Logging out - POST /api/v1/user/logout', () => {
    it('should return a 400 error if the refreshToken is empty', async () => {
      const response = await request(server)
        .post('/api/v1/user/logout')
        .set('Authorization', `Bearer ${loginTokens.accessToken}`)
        .send({ refreshToken: '' });

      response.status.should.be.eq(400);
      response.body.should.have.property('error').eql('Empty refresh token');
    });

    it('should be able to handle errors when verifying the token', async () => {
      const stub = sinon.stub(jwt, 'verify').onFirstCall().throws();

      const response = await request(server)
        .post('/api/v1/user/logout')
        .set('Cookie', `${REFRESH_TOKEN_COOKIE_NAME}=${loginTokens.refreshToken}`);

      response.status.should.be.eq(200);

      stub.restore();
    });

    it('should be able to logout the user successfully', async () => {
      const response = await request(server)
        .post('/api/v1/user/logout')
        .set('Cookie', `${REFRESH_TOKEN_COOKIE_NAME}=${loginTokens.refreshToken}`);

      response.status.should.be.eq(200);
      response.body.should.have.property('message').eql('Logged out');
      response.headers.should.have.property('set-cookie');
      response.headers['set-cookie'].should.be.an('array');
      response.headers['set-cookie'].should.have.lengthOf(1);
      response.headers['set-cookie'][0].should.match(new RegExp(`^${REFRESH_TOKEN_COOKIE_NAME}=; Path=\/; Expires=Thu, 01 Jan 1970 00:00:00 GMT$`));
    });
  });

  describe('Changing Password - POST /api/v1/user/change-password', () => {
    let token: string;

    before(async () => {
      await UserModel.findByIdAndUpdate(adminUser.id!, { email: adminUser.email });
    });

    beforeEach(() => {
      token = createAccessToken(
        adminUser.email,
        'admin',
        adminUser.firstName,
        adminUser.lastName,
        adminUser.id!,
      );
    });

    it('should return 400 if the oldPassword is empty', async () => {
      const response = await request(server)
        .post('/api/v1/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: '', newPassword: 'Maka-jan32' });

      response.status.should.be.eq(400);
      response.body.should.have.property('error').eql('Invalid old password or new password');
    });

    it('should return 400 if the newPassword is empty', async () => {
      const response = await request(server)
        .post('/api/v1/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'adminPassword', newPassword: '' });

      response.status.should.be.eq(400);
      response.body.should.have.property('error').eql('Invalid old password or new password');
    });

    it('should return 500 if the user is not found', async () => {
      const badEmail = 'not@gmail.com';
      token = createAccessToken(
        badEmail,
        'admin',
        'not',
        'found',
        new Types.ObjectId().toHexString(),
      );

      const response = await request(server)
        .post('/api/v1/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'adminPassword', newPassword: 'Maka-jan32' });

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql(`No user was found with email: ${badEmail}`);
    });

    it('should return 500 if the password is not a match', async () => {
      const response = await request(server)
        .post('/api/v1/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'wrongPassword', newPassword: 'Maka-jan32' });

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('Invalid Password');
    });

    it('should change password successfully', async () => {
      const response = await request(server)
        .post('/api/v1/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'adminPassword', newPassword: 'Maka-jan32' });

      response.status.should.be.eq(200);
      response.body.should.have.property('message').eql('Password changed');
    });
  });

  describe('Resetting Password - POST /api/v1/user/reset-password', () => {
    it('should return 400 if the email is empty', async () => {
      const response = await request(server)
        .post('/api/v1/user/reset-password')
        .send({ email: '' });

      response.status.should.be.eq(400);
      response.body.should.have.property('error').eql('Invalid email');
    });

    it('should return 400 if the email is not valid', async () => {
      const response = await request(server)
        .post('/api/v1/user/reset-password')
        .send({ email: 'email' });

      response.status.should.be.eq(400);
      response.body.should.have.property('error').eql('Invalid email');
    });

    it('should return 500 if the user is not found', async () => {
      const badEmail = 'not@gmail.com';

      const response = await request(server)
        .post('/api/v1/user/reset-password')
        .send({ email: badEmail });

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('Could not reset password. Try again later.');
    });

    it('should return 500 if finding the user throws an error', async () => {
      const stub = sinon.stub(UserModel, 'findOne').throws();

      const response = await request(server)
        .post('/api/v1/user/reset-password')
        .send({ email: adminUser.email });

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('Error');

      stub.restore();
    });

    it('should return 200 if the password was reset', async () => {
      const response = await request(server)
        .post('/api/v1/user/reset-password')
        .send({ email: adminUser.email });

      response.status.should.be.eq(200);
      response.body.should.have.property('message').eql(`New password sent to ${adminUser.email}`);
    });
  });

  describe('Registering a new user - POST /api/v1/user/register', () => {
    it('should be able to register a new user successfully', async () => {
      const response = await request(server)
        .post('/api/v1/user/register')
        .send(newUser);

      response.status.should.be.eq(200);
      response.body.should.have.property('user');
      response.body.should.have.property('accessToken');
      response.headers.should.have.property('set-cookie');

      newUser.id = response.body.user.id;
    });

    it('should return 400 if the email is already in use', async () => {
      const response = await request(server)
        .post('/api/v1/user/register')
        .send(newUser);

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('duplicateUser');
    });

    it('should return 500 if the password is not strong enough', async () => {
      const newUser = {...adminUser, password: 'password'};

      const response = await request(server)
        .post('/api/v1/user/register')
        .send(newUser);

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('Password does not follow the rules');
    });

    it('should return 500 if the email is not valid', async () => {
      const newUser = {...adminUser, password: 'Jaka-jan32', email: 'email'};

      const response = await request(server)
        .post('/api/v1/user/register')
        .send(newUser);

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('user validation failed: email: Path `email` is invalid (email).');
    });

    it('should return 500 if the firstName is missing', async () => {
      const newUser = {...adminUser, password: 'Jaka-jan32', firstName: ''};

      const response = await request(server)
        .post('/api/v1/user/register')
        .send(newUser);

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('user validation failed: firstName: Path `firstName` is required.');
    });

    it('should return 500 if the lastName is missing', async () => {
      const newUser = {...adminUser, password: 'Jaka-jan32', lastName: ''};

      const response = await request(server)
        .post('/api/v1/user/register')
        .send(newUser);

      response.status.should.be.eq(500);
      response.body.should.have.property('error').eql('user validation failed: lastName: Path `lastName` is required.');
    });
  });
});
