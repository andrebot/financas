import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import server from '../../src/server/server';
import { adminUser } from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager'
import UserModel from '../../src/server/resources/userModel'

chai.use(chaiHttp);

describe('Authentication', () => {
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
    let newUser = {
      email: 'test1@gmail.com',
      firstName: 'Test1',
      lastName: 'User1',
      password: 'Maka-jan32',
    };
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
});
