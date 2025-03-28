import chai from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import { Types } from 'mongoose';
import server from '../../src/server/server';
import { account1, account2, account3, adminUser } from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager';
import accountModel from '../../src/server/resources/models/accountModel';

describe('Account', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = createAccessToken(
      adminUser.email,
      'admin',
      adminUser.firstName,
      adminUser.lastName,
      adminUser.id!,
    );
  });

  describe('List Accounts - GET /api/v1/account', () => {
    it('should return the list of accounts', async () => {
      const response = await request(server)
        .get('/api/v1/account')
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('array');
      response.body.should.have.lengthOf(2);
    });

    it('should return nothing when user has no accounts', async () => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      const response = await request(server)
        .get('/api/v1/account')
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('array');
      response.body.should.have.lengthOf(0);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .get('/api/v1/account');

      response.status.should.be.eq(401);
    });

    it('should return 500 when an error occurs', async () => {
      const stub = sinon.stub(accountModel, 'find').throws(new Error('Error'));

      const response = await request(server)
        .get('/api/v1/account')
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(500);
      stub.restore();
    });
  });

  describe('Retrieve Account - GET /api/v1/account/:id', () => {
    it('should return the account', async () => {
      const response = await request(server)
        .get(`/api/v1/account/${account1.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
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
    });

    it('should return empty if an account is not found', async () => {
      const response = await request(server)
        .get(`/api/v1/account/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.empty;
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .get(`/api/v1/account/${account1.id}`);

      response.status.should.be.eq(401);
    });

    it('should return 500 when an error occurs', async () => {
      const stub = sinon.stub(accountModel, 'findOne').throws(new Error('Error'));

      const response = await request(server)
        .get(`/api/v1/account/${account1.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(500);
      stub.restore();
    });
  });

  describe('Create Account - POST /api/v1/account', () => {
    it('should create an account', async () => {
      const newAccount = {
        name: 'Test Account',
        agency: '1234',
        accountNumber: '123',
        currency: 'BRL',
        user: adminUser.id,
      };

      const response = await request(server)
        .post('/api/v1/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newAccount);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', newAccount.name);
      response.body.should.have.property('agency', newAccount.agency);
      response.body.should.have.property('accountNumber', newAccount.accountNumber);
      response.body.should.have.property('currency', newAccount.currency);
      response.body.should.have.property('cards');
      response.body.cards.should.be.an('array');
      response.body.cards.should.have.lengthOf(0);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .post('/api/v1/account')
        .send(account2);

      response.status.should.be.eq(401);
    });

    it('should return 500 when an error occurs', async () => {
      const stub = sinon.stub(accountModel.prototype, 'save').throws(new Error('Error'));

      const response = await request(server)
        .post('/api/v1/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(account2);

      response.status.should.be.eq(500);
      stub.restore();
    });
  });

  describe('Update Account - PUT /api/v1/account/:id', () => {
    it('should update an account', async () => {
      const updatedAccount = {
        name: 'Updated Account',
        agency: '1234',
        accountNumber: '123',
        currency: 'BRL',
      };

      const response = await request(server)
        .put(`/api/v1/account/${account1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedAccount);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', updatedAccount.name);
      response.body.should.have.property('agency', updatedAccount.agency);
      response.body.should.have.property('accountNumber', updatedAccount.accountNumber);
      response.body.should.have.property('currency', updatedAccount.currency);
      response.body.should.have.property('cards');
      response.body.cards.should.be.an('array');
      response.body.cards.should.have.lengthOf(1);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .put(`/api/v1/account/${account1.id}`)
        .send(account2);

      response.status.should.be.eq(401);
    });

    it('should throw 500 when no information is provided', async () => {
      const response = await request(server)
        .put(`/api/v1/account/${account1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      response.status.should.be.eq(500);
    });

    it('should throw 500 when provided an empty object to update', async () => {
      const response = await request(server)
        .put(`/api/v1/account/${account1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      response.status.should.be.eq(500);
    });

    it('should be able to update another user\'s account if is admin', async () => {
      const response = await request(server)
        .put(`/api/v1/account/${account3.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(account2);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', account2.name);
      response.body.should.have.property('agency', account2.agency);
      response.body.should.have.property('accountNumber', account2.accountNumber);
      response.body.should.have.property('currency', account2.currency);

      account3.name = account2.name;
      account3.agency = account2.agency;
      account3.accountNumber = account2.accountNumber;
      account3.currency = account2.currency;
    });

    it('should return 403 when the user is not allowed to update the account', async () => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      const response = await request(server)
        .put(`/api/v1/account/${account3.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(account2);

      response.status.should.be.eq(403);
    });

    it('should return 404 if no account is found', async () => {
      const response = await request(server)
        .put(`/api/v1/account/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(account2);

      response.status.should.be.eq(404);
    });

    it('should return 500 when an error occurs', async () => {
      const stub = sinon.stub(accountModel, 'findOneAndUpdate').throws(new Error('Error'));

      const response = await request(server)
        .put(`/api/v1/account/${account1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(account2);

      response.status.should.be.eq(500);
      stub.restore();
    });
  });

  describe('Delete Account - DELETE /api/v1/account/:id', () => {
    it('should delete an account', async () => {
      const response = await request(server)
        .delete(`/api/v1/account/${account2.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', account2.name);
      response.body.should.have.property('agency', account2.agency);
      response.body.should.have.property('accountNumber', account2.accountNumber);
      response.body.should.have.property('currency', account2.currency);
      response.body.should.have.property('cards');
      response.body.cards.should.be.an('array');
      response.body.cards.should.have.lengthOf(1);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .delete(`/api/v1/account/${account1.id}`);

      response.status.should.be.eq(401);
    });

    it('should be able to delete another user\'s account if is admin', async () => {
      const response = await request(server)
        .delete(`/api/v1/account/${account3.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', account3.name);
      response.body.should.have.property('agency', account3.agency);
      response.body.should.have.property('accountNumber', account3.accountNumber);
      response.body.should.have.property('currency', account3.currency);
      response.body.should.have.property('cards');
      response.body.cards.should.be.an('array');
      response.body.cards.should.have.lengthOf(1);
    });

    it('should return 403 when the user is not allowed to delete the account', async () => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      const response = await request(server)
        .delete(`/api/v1/account/${account1.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(account2);

      response.status.should.be.eq(403);
    });

    it('should return 404 if no account is found', async () => {
      const response = await request(server)
        .delete(`/api/v1/account/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(404);
    });

    it('should return 500 when an error occurs', async () => {
      const stub = sinon.stub(accountModel, 'findByIdAndDelete').throws(new Error('Error'));

      const response = await request(server)
        .delete(`/api/v1/account/${account1.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(500);
      stub.restore();
    });
  });
});
