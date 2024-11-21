import chai from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import server from '../../src/server/server';
import { adminUser } from './connectDB';
import { createAccessToken, createRefreshToken } from '../../src/server/managers/authenticationManager';
import UserModel from '../../src/server/resources/models/userModel';
import { addToken, deleteToken } from '../../src/server/resources/repositories/tokenRepo';
import { Types } from 'mongoose';

describe('Authentication', () => {
  let newUser = {
    _id: '',
    email: 'test1@gmail.com',
    firstName: 'Test1',
    lastName: 'User1',
    password: 'Maka-jan32',
  };
  let loginTokens: { accessToken: string, refreshToken: string };

  describe('Listing Users - GET /api/v1/user', () => {
    it('should return a 401 error if the user is not authenticated', (done) => {
      chai.request(server)
        .get('/api/v1/user')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should list users successfully if the user is authenticated', (done) => {
      const token = createAccessToken(
        adminUser.email,
        'admin',
        adminUser.firstName,
        adminUser.lastName,
        adminUser._id,
      );

      chai.request(server)
        .get('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200);

          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          done();
        });
    });

    it('should return a 403 error if the user is authenticated but not an admin', (done) => {
      const token = createAccessToken(
        adminUser.email,
        'user',
        adminUser.firstName,
        adminUser.lastName,
        adminUser._id,
      );

      chai.request(server)
        .get('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

    it('should return a 500 error if an error occurs', (done) => {
      const token = createAccessToken(
        adminUser.email,
        'admin',
        adminUser.firstName,
        adminUser.lastName,
        adminUser._id,
      );
      const stub = sinon.stub(UserModel, 'find').throws();

      chai.request(server)
        .get('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql('Error');

          stub.restore();
          done();
        });
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
        adminUser._id,
      );
    });

    it('should return a 401 error if the user is not authenticated', (done) => {
      chai.request(server)
        .post('/api/v1/user')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should create a user successfully if the user is an admin', (done) => {
      chai.request(server)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('email').eql(newUser.email);
          res.body.should.have.property('firstName').eql(newUser.firstName);
          res.body.should.have.property('lastName').eql(newUser.lastName);
          res.body.should.have.property('role').eql('user');
          res.body.should.have.property('_id');
          res.body.should.not.have.property('password');

          newUser._id = res.body._id;
          done();
        });
    });

    it('should return a 403 error if the user is authenticated but not an admin', (done) => {
      const token = createAccessToken(
        adminUser.email,
        'user',
        adminUser.firstName,
        adminUser.lastName,
        adminUser._id,
      );

      chai.request(server)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

    it('should return an error 500 if the user already exists', (done) => {
      const newUser = {...adminUser, password: 'Maka-jan32'};

      chai.request(server)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql('E11000 duplicate key error collection: test.users index: email_1 dup key: { email: "admin@example.com" }');
          done();
        });
    });

    it('should return error 500 if the password is not strong enough', (done) => {
      const newUser = {...adminUser, password: 'password'};

      chai.request(server)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql('Password does not follow the rules');
          done();
        });
    });

    it('should return error 500 if the email is not valid', (done) => {
      const newUser = {...adminUser, email: 'test', password: 'Maka-jan32'};

      chai.request(server)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql('user validation failed: email: Path `email` is invalid (test).');
          done();
        });
    });

    it('should return error 500 if firstName is missing', (done) => {
      const newUser = {...adminUser, firstName: '', password: 'Maka-jan32'};

      chai.request(server)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql('user validation failed: firstName: Path `firstName` is required.');
          done();
        });
    });

    it('should return error 500 if lastName is missing', (done) => {
      const newUser = {...adminUser, lastName: '', password: 'Maka-jan32'};

      chai.request(server)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql('user validation failed: lastName: Path `lastName` is required.');
          done();
        });
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
        newUser._id,
      );
    });

    it('should be able to update an user if the user is an admin', (done) => {
      token = createAccessToken(
        adminUser.email,
        'admin',
        adminUser.firstName,
        adminUser.lastName,
        adminUser._id,
      );
      adminUser.firstName.should.be.eql('Admin');

      chai.request(server)
        .put(`/api/v1/user/${adminUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Admin1' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('firstName').eql('Admin1');
          res.body.should.not.have.property('password');
          done();
        });
    });

    it('should not be able to update a user if it is not the same user', (done) => {
      token = createAccessToken(
        'another@gmail.com',
        'user',
        'nothing',
        'here',
        new Types.ObjectId().toHexString(),
      );

      chai.request(server)
        .put(`/api/v1/user/${newUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Test2' })
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('error').eql('You do not have permission to update this user');
          done();
        });
    });

    it('should not be able to update password of an user if it is the same user', (done) => {
      chai.request(server)
        .put(`/api/v1/user/${newUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'Gero-jun23' })
        .end((err, res) => {
          res.should.have.status(500);

          done();
        });
    });

    it('should not be able to update role of an user if it is the same user', (done) => {
      chai.request(server)
        .put(`/api/v1/user/${newUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'admin' })
        .end((err, res) => {
          res.should.have.status(500);

          done();
        });
    });

    it('should be able to update firstName of an user if it is the same user', (done) => {
      chai.request(server)
        .put(`/api/v1/user/${newUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Test2' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('firstName').eql('Test2');
          res.body.should.not.have.property('password');

          done();
        });
    });

    it('should be able to update lastName of an user if it is the same user', (done) => {
      chai.request(server)
        .put(`/api/v1/user/${newUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ lastName: 'bogabofa' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('lastName').eql('bogabofa');
          res.body.should.not.have.property('password');

          done();
        });
    });

    it('should be able to update email of an user if it is the same user', (done) => {
      const newEmail = 'new@email.com';

      chai.request(server)
        .put(`/api/v1/user/${newUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: newEmail })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('email').eql(newEmail);
          res.body.should.not.have.property('password');

          newUser.email = newEmail;
          done();
        });
    });

    it('should be able to handle errors when finding the user to be updated', (done) => {
      const stub = sinon.stub(UserModel, 'findById').throws();

      chai.request(server)
        .put(`/api/v1/user/${newUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'nada@gmail.com' })
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql('Error');

          stub.restore();
          done();
        });
    });

    it('should throw an error if no user is found', (done) => {
      chai.request(server)
        .put(`/api/v1/user/34865234582734n523485n23487`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'nada@gmail.com' })
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql('Cast to ObjectId failed for value "34865234582734n523485n23487" (type string) at path "_id" for model "user"');

          done();
        });
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
        adminUser._id,
      );
    });

    it('shoud return a 401 error if the user is not an admin', (done) => {
      token = createAccessToken(
        newUser.email,
        'user',
        newUser.firstName,
        newUser.lastName,
        newUser._id,
      );

      chai.request(server)
        .delete(`/api/v1/user/${newUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

    it('should return a 401 error if the user is not authenticated', (done) => {
      chai.request(server)
        .delete(`/api/v1/user/${newUser._id}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should not be able to delete a user if the id it not valid', (done) => {
      chai.request(server)
        .delete(`/api/v1/user/34865234582734n523485n23487`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('error').eql('Invalid id');

          done();
        });
    });

    it('should be able to delete an user if it is an admin', (done) => {
      chai.request(server)
        .delete(`/api/v1/user/${newUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('message').eql(`User deleted: id ${newUser._id}`);

          done();
        });
    });

    it('should return error if the user is not found', (done) => {
      chai.request(server)
        .delete(`/api/v1/user/${newUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql(`User not found ${newUser._id}`);

          done();
        });
    });

    it('should return error if an error occurs', (done) => {
      const stub = sinon.stub(UserModel, 'findByIdAndDelete').throws();

      chai.request(server)
        .delete(`/api/v1/user/${newUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql('Error');

          stub.restore();
          done();
        });
    });
  });

  describe('Logging in - POST /api/v1/login', () => {
    it('should return a 500 error if the user is not found', (done) => {
      chai.request(server)
        .post('/api/v1/user/login')
        .send({ email: 'andre.almeida@gmail.com', password: 'Maka-jan32' })
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql('User not found');
          done();
        });
    });

    it('should return a 400 error if the email is not valid', (done) => {
      chai.request(server)
        .post('/api/v1/user/login')
        .send({ email: 'andre.almeida', password: 'Maka-jan32' })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('error').eql('Invalid email or password');
          done();
        });
    });

    it('should return a 400 error if the email is empty', (done) => {
      chai.request(server)
        .post('/api/v1/user/login')
        .send({ password: 'Maka-jan32' })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('error').eql('Invalid email or password');
          done();
        });
    });

    it('should return a 400 error if the password is empty', (done) => {
      chai.request(server)
        .post('/api/v1/user/login')
        .send({ email: 'andre.almeida@gmail.com' })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('error').eql('Invalid email or password');
          done();
        });
    });

    it('should return a 400 error if the password is not a match', (done) => {
      chai.request(server)
        .post('/api/v1/user/login')
        .send({ email: adminUser.email, password: 'wrong password' })
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql('Password was not a match');
          done();
        });
    });

    it('should return a 200 status and the tokens if the user is found', (done) => {	
      chai.request(server)	
        .post('/api/v1/user/login')	
        .send({ email: adminUser.email, password: 'adminPassword' })	
        .end((err, res) => {	
          res.should.have.status(200);	
          res.body.should.have.property('accessToken');	
          res.body.should.have.property('refreshToken');

          loginTokens = res.body;
          done();	
        });	
    });
  });

  describe('Logging out - POST /api/v1/user/logout', () => {
    it('should return a 400 error if the refreshToken is empty', (done) => {
      chai.request(server)
        .post('/api/v1/user/logout')
        .set('Authorization', `Bearer ${loginTokens.accessToken}`)
        .send({ refreshToken: '' })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('error').eql('Empty refresh token');
          done();
        });
    });

    it('should be able to handle errors when verifying the token', (done) => {
      const stub = sinon.stub(jwt, 'verify').onSecondCall().throws();

      chai.request(server)
        .post('/api/v1/user/logout')
        .set('Authorization', `Bearer ${loginTokens.accessToken}`)
        .send({ refreshToken: loginTokens.refreshToken })
        .end((err, res) => {
          res.should.have.status(403);

          stub.restore();
          done();
        });
    });

    it('should be able to logout the user successfully', (done) => {
      chai.request(server)
        .post('/api/v1/user/logout')
        .set('Authorization', `Bearer ${loginTokens.accessToken}`)
        .send({ refreshToken: loginTokens.refreshToken })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('message').eql('Logged out');
          done();
        });
    });
  });

  describe('Refreshing Tokens - POST /api/v1/user/refresh-tokens', () => {
    let refreshToken: string;
    let accessToken: string;

    beforeEach(() => {
      refreshToken = createRefreshToken(adminUser.email);
      accessToken = createAccessToken(
        adminUser.email,
        'admin',
        adminUser.firstName,
        adminUser.lastName,
        adminUser._id,
      );

      addToken(refreshToken);
    });

    afterEach(() => {
      deleteToken(refreshToken);
    });

    it('should return a 400 error if the refreshToken is empty', (done) => {
      chai.request(server)
        .post('/api/v1/user/refresh-tokens')
        .send({ refreshToken: '' })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('error').eql('Empty refresh token');
          done();
        });
    });

    it('should be able to handle errors when verifying the token', (done) => {
      const stub = sinon.stub(jwt, 'verify').throws();

      chai.request(server)
        .post('/api/v1/user/refresh-tokens')
        .send({ refreshToken })
        .end((err, res) => {
          res.should.have.status(500);

          stub.restore();
          done();
        });
    });

    it('should be able to refresh the tokens successfully if refreshToken is valid', (done) => {
      chai.request(server)
        .post('/api/v1/user/refresh-tokens')
        .send({ refreshToken })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('accessToken');
          res.body.should.have.property('refreshToken');

          done();
        });
    });

    it('should return 500 if cannot find the user', (done) => {
      const badEmail = 'naotem@gmail.com';
      refreshToken = createRefreshToken(badEmail);
      addToken(refreshToken);

      chai.request(server)
        .post('/api/v1/user/refresh-tokens')
        .send({ refreshToken })
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql(`No user was found with email: ${badEmail}`);

          done();
        });
    });

    it('should return 500 if finding the user throws an error', (done) => {
      const stub = sinon.stub(UserModel, 'findOne').throws();

      chai.request(server)
        .post('/api/v1/user/refresh-tokens')
        .send({ refreshToken })
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql('Error');

          stub.restore();
          done();
        });
    });
  });

  describe('Changing Password - POST /api/v1/user/change-password', () => {
    let token: string;

    before(async () => {
      await UserModel.findByIdAndUpdate(adminUser._id, { email: adminUser.email });
    });

    beforeEach(() => {
      token = createAccessToken(
        adminUser.email,
        'admin',
        adminUser.firstName,
        adminUser.lastName,
        adminUser._id,
      );
    });

    it('should return 400 if the oldPassword is empty', (done) => {
      chai.request(server)
        .post('/api/v1/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: '', newPassword: 'Maka-jan32' })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('error').eql('Invalid password');
          done();
        });
    });

    it('should return 400 if the newPassword is empty', (done) => {
      chai.request(server)
        .post('/api/v1/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'adminPassword', newPassword: '' })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('error').eql('Invalid password');
          done();
        });
    });

    it('should return 500 if the user is not found', (done) => {
      const badEmail = 'not@gmail.com';
      token = createAccessToken(
        badEmail,
        'admin',
        'not',
        'found',
        new Types.ObjectId().toHexString(),
      );

      chai.request(server)
        .post('/api/v1/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'adminPassword', newPassword: 'Maka-jan32' })
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql(`No user was found with email: ${badEmail}`);
          done();
        });
    });

    it('should return 500 if the password is not a match', (done) => {
      chai.request(server)
        .post('/api/v1/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'wrongPassword', newPassword: 'Maka-jan32' })
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql('Invalid Password');
          done();
        });
    });

    it('should change password successfully', (done) => {
      chai.request(server)
        .post('/api/v1/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'adminPassword', newPassword: 'Maka-jan32' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('message').eql('Password changed');
          done();
        });
    });
  });

  describe('Resetting Password - POST /api/v1/user/reset-password', () => {
    it('should return 400 if the email is empty', (done) => {
      chai.request(server)
        .post('/api/v1/user/reset-password')
        .send({ email: '' })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('error').eql('Invalid email');
          done();
        });
    });

    it('should return 400 if the email is not valid', (done) => {
      chai.request(server)
        .post('/api/v1/user/reset-password')
        .send({ email: 'email' })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('error').eql('Invalid email');
          done();
        });
    });

    it('should return 500 if the user is not found', (done) => {
      const badEmail = 'not@gmail.com';

      chai.request(server)
        .post('/api/v1/user/reset-password')
        .send({ email: badEmail })
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql(`No user was found with email: ${badEmail}`);
          done();
        });
    });

    it('should return 500 if finding the user throws an error', (done) => {
      const stub = sinon.stub(UserModel, 'findOne').throws();

      chai.request(server)
        .post('/api/v1/user/reset-password')
        .send({ email: adminUser.email })
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql('Error');

          stub.restore();
          done();
        });
    });

    it('should return 200 if the password was reset', (done) => {
      chai.request(server)
        .post('/api/v1/user/reset-password')
        .send({ email: adminUser.email })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('message').eql(`New password sent to ${adminUser.email}`);

          done();
        });
    });
  });
});
