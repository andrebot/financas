import chai from 'chai';
import sinon from 'sinon';
import { Types } from 'mongoose';
import server from '../../src/server/server';
import { account1, account2, account3, adminUser } from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager';
import accountModel from '../../src/server/resources/accountModel';

describe('Account', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = createAccessToken(
      adminUser.email,
      'admin',
      adminUser.firstName,
      adminUser.lastName,
      adminUser._id,
    );
  });

  describe('List Accounts - GET /api/v1/account', () => {
    it('should return the list of accounts', (done) => {
      chai.request(server)
        .get('/api/v1/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.have.lengthOf(2);

          done();
        });
    });

    it('should return nothing when user has no accounts', (done) => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      chai.request(server)
        .get('/api/v1/account')
        .set('Authorization', `Bearer ${token}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.have.lengthOf(0);

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .get('/api/v1/account')
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(accountModel, 'find').throws(new Error('Error'));

      chai.request(server)
        .get('/api/v1/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });

  describe('Retrieve Account - GET /api/v1/account/:id', () => {
    it('should return the account', (done) => {
      chai.request(server)
        .get(`/api/v1/account/${account1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', account1.name);
          response.body.should.have.property('agency', account1.agency);
          response.body.should.have.property('accountNumber', account1.accountNumber);
          response.body.should.have.property('currency', account1.currency);
          response.body.should.have.property('cards');
          response.body.cards.should.be.an('array');
          response.body.cards.should.have.lengthOf(1);
          response.body.cards[0].should.have.property('number', account1.cards[0].number);
          response.body.cards[0].should.have.property('expirationDate', account1.cards[0].expirationDate);

          done();
        });
    });

    it('should return empty if an account is not found', (done) => {
      chai.request(server)
        .get(`/api/v1/account/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          chai.expect(response.body).to.be.empty;

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .get(`/api/v1/account/${account1._id}`)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(accountModel, 'findById').throws(new Error('Error'));

      chai.request(server)
        .get(`/api/v1/account/${account1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });

  describe('Create Account - POST /api/v1/account', () => {
    it('should create an account', (done) => {
      const newAccount = {
        name: 'Test Account',
        agency: '1234',
        accountNumber: '123',
        currency: 'BRL',
        user: adminUser._id,
      };

      chai.request(server)
        .post('/api/v1/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newAccount)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', newAccount.name);
          response.body.should.have.property('agency', newAccount.agency);
          response.body.should.have.property('accountNumber', newAccount.accountNumber);
          response.body.should.have.property('currency', newAccount.currency);
          response.body.should.have.property('cards');
          response.body.cards.should.be.an('array');
          response.body.cards.should.have.lengthOf(0);

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .post('/api/v1/account')
        .send(account2)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(accountModel.prototype, 'save').throws(new Error('Error'));

      chai.request(server)
        .post('/api/v1/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(account2)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });

  describe('Update Account - PUT /api/v1/account/:id', () => {
    it('should update an account', (done) => {
      const updatedAccount = {
        name: 'Updated Account',
        agency: '1234',
        accountNumber: '123',
        currency: 'BRL',
      };

      chai.request(server)
        .put(`/api/v1/account/${account1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedAccount)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', updatedAccount.name);
          response.body.should.have.property('agency', updatedAccount.agency);
          response.body.should.have.property('accountNumber', updatedAccount.accountNumber);
          response.body.should.have.property('currency', updatedAccount.currency);
          response.body.should.have.property('cards');
          response.body.cards.should.be.an('array');
          response.body.cards.should.have.lengthOf(1);

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .put(`/api/v1/account/${account1._id}`)
        .send(account2)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should throw 500 when no information is provided', (done) => {
      chai.request(server)
        .put(`/api/v1/account/${account1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          done();
        });
    });

    it('should throw 500 when provided an empty object to update', (done) => {
      chai.request(server)
        .put(`/api/v1/account/${account1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .end((err, response) => {
          response.should.have.status(500);
          done();
        });
    });

    it('should be able to update another user\'s account if is admin', (done) => {
      chai.request(server)
        .put(`/api/v1/account/${account3._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(account2)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', account2.name);
          response.body.should.have.property('agency', account2.agency);
          response.body.should.have.property('accountNumber', account2.accountNumber);
          response.body.should.have.property('currency', account2.currency);

          done();
        });
    });

    it('should return 403 when the user is not allowed to update the account', (done) => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      chai.request(server)
        .put(`/api/v1/account/${account3._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(account2)
        .end((err, response) => {
          response.should.have.status(403);
          done();
        });
    });

    it('should return 500 if no account is found', (done) => {
      chai.request(server)
        .put(`/api/v1/account/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(account2)
        .end((err, response) => {
          response.should.have.status(500);
          done();
        });
    });
  });

  describe('Delete Account - DELETE /api/v1/account/:id', () => {
    it('should delete an account', (done) => {
      chai.request(server)
        .delete(`/api/v1/account/${account2._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', account2.name);
          response.body.should.have.property('agency', account2.agency);
          response.body.should.have.property('accountNumber', account2.accountNumber);
          response.body.should.have.property('currency', account2.currency);
          response.body.should.have.property('cards');
          response.body.cards.should.be.an('array');
          response.body.cards.should.have.lengthOf(1);

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .delete(`/api/v1/account/${account1._id}`)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should be able to delete another user\'s account if is admin', (done) => {
      chai.request(server)
        .delete(`/api/v1/account/${account3._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', account3.name);
          response.body.should.have.property('agency', account3.agency);
          response.body.should.have.property('accountNumber', account3.accountNumber);
          response.body.should.have.property('currency', account3.currency);
          response.body.should.have.property('cards');
          response.body.cards.should.be.an('array');
          response.body.cards.should.have.lengthOf(1);

          done();
        });
    });

    it('should return 403 when the user is not allowed to delete the account', (done) => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      chai.request(server)
        .delete(`/api/v1/account/${account1._id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, response) => {
          response.should.have.status(403);
          done();
        });
    });

    it('should return 500 if no account is found', (done) => {
      chai.request(server)
        .delete(`/api/v1/account/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(accountModel, 'findByIdAndDelete').throws(new Error('Error'));

      chai.request(server)
        .delete(`/api/v1/account/${account1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });
});
