import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import server from '../../src/server/server';
import { adminUser } from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager'
import UserModel from '../../src/server/resources/userModel'

chai.use(chaiHttp);

describe('Authentication', () => {
  let newUser = {
    _id: '',
    email: 'test1@gmail.com',
    firstName: 'Test1',
    lastName: 'User1',
    password: 'Maka-jan32',
  };

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
      const token = createAccessToken(adminUser.email, 'admin', adminUser.firstName, adminUser.lastName);

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
      const token = createAccessToken(adminUser.email, 'user', adminUser.firstName, adminUser.lastName);

      chai.request(server)
        .get('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

    it('should return a 500 error if an error occurs', (done) => {
      const token = createAccessToken(adminUser.email, 'admin', adminUser.firstName, adminUser.lastName);
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
      token = createAccessToken(adminUser.email, 'admin', adminUser.firstName, adminUser.lastName);
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
      const token = createAccessToken(adminUser.email, 'user', adminUser.firstName, adminUser.lastName);

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
      token = createAccessToken(newUser.email, 'user', newUser.firstName, newUser.lastName);
    });

    it('should be able to update an user if the user is an admin', (done) => {
      token = createAccessToken(adminUser.email, 'admin', adminUser.firstName, adminUser.lastName);
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
      token = createAccessToken('another@gmail.com', 'user', 'nothing', 'here');

      chai.request(server)
        .put(`/api/v1/user/${newUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Test2' })
        .end((err, res) => {
          res.should.have.status(401);
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
      token = createAccessToken(adminUser.email, 'admin', adminUser.firstName, adminUser.lastName);
    });

    it('shoud return a 401 error if the user is not an admin', (done) => {
      token = createAccessToken(newUser.email, 'user', newUser.firstName, newUser.lastName);

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
});
