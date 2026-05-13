import request from 'supertest';
import server from '../../src/server/server';
import {
  account1, account2, account3, adminUser, otherUser, userToDelete,
} from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager';

describe('Account', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = createAccessToken(
      adminUser.email,
      'admin',
      adminUser.firstName,
      adminUser.lastName,
      adminUser.id,
    );
  });

  describe('List Accounts - GET /api/v1/account', () => {
    it('should return all accounts when user is admin', async () => {
      const response = await request(server)
        .get('/api/v1/account')
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('array');
      response.body.should.have.lengthOf(3);
    });

    it('should return only own accounts when user is not admin', async () => {
      const token = createAccessToken(
        otherUser.email,
        'user',
        otherUser.firstName,
        otherUser.lastName,
        otherUser.id,
      );

      const response = await request(server)
        .get('/api/v1/account')
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('array');
      response.body.should.have.lengthOf(1);
    });

    it('should return nothing when user has no accounts', async () => {
      const token = createAccessToken(
        userToDelete.email,
        'user',
        userToDelete.firstName,
        userToDelete.lastName,
        userToDelete.id,
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
    });

    it('should return empty if an account is not found', async () => {
      const response = await request(server)
        .get('/api/v1/account/999999')
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.empty;
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .get(`/api/v1/account/${account1.id}`);

      response.status.should.be.eq(401);
    });
  });

  describe('Create Account - POST /api/v1/account', () => {
    it('should create an account', async () => {
      const newAccount = {
        name: 'Test Account',
        agency: '1234',
        accountNumber: '123',
        currency: 'BRL',
        initialBalance: 0,
        userId: adminUser.id,
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
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .post('/api/v1/account')
        .send(account2);

      response.status.should.be.eq(401);
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

    it('should be able to update another user\'s account if is admin', async () => {
      const updatedFields = {
        name: 'Admin Updated Name',
        agency: account3.agency,
        accountNumber: account3.accountNumber,
        currency: account3.currency,
      };

      const response = await request(server)
        .put(`/api/v1/account/${account3.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedFields);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', updatedFields.name);

      account3.name = updatedFields.name;
    });

    it('should not update another user\'s account if not admin', async () => {
      const token = createAccessToken(
        userToDelete.email,
        'user',
        userToDelete.firstName,
        userToDelete.lastName,
        userToDelete.id,
      );

      const response = await request(server)
        .put(`/api/v1/account/${account3.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Stolen Update' });

      response.status.should.be.eq(200);
      response.body.should.be.empty;
    });
  });

  describe('Delete Account - DELETE /api/v1/account/:id', () => {
    let ownDeleteId: number;
    let otherDeleteId: number;

    before(async () => {
      const adminToken = createAccessToken(
        adminUser.email,
        'admin',
        adminUser.firstName,
        adminUser.lastName,
        adminUser.id,
      );
      const otherToken = createAccessToken(
        otherUser.email,
        'user',
        otherUser.firstName,
        otherUser.lastName,
        otherUser.id,
      );

      const ownRes = await request(server)
        .post('/api/v1/account')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Delete Me Own',
          agency: '9991',
          accountNumber: '999111',
          currency: 'BRL',
          initialBalance: 0,
          userId: adminUser.id,
        });
      ownDeleteId = ownRes.body.id;

      const otherRes = await request(server)
        .post('/api/v1/account')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          name: 'Delete Me Other',
          agency: '9992',
          accountNumber: '999222',
          currency: 'USD',
          initialBalance: 0,
          userId: otherUser.id,
        });
      otherDeleteId = otherRes.body.id;
    });

    it('should delete an account', async () => {
      const response = await request(server)
        .delete(`/api/v1/account/${ownDeleteId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', 'Delete Me Own');
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .delete(`/api/v1/account/${account1.id}`);

      response.status.should.be.eq(401);
    });

    it('should be able to delete another user\'s account if is admin', async () => {
      const response = await request(server)
        .delete(`/api/v1/account/${otherDeleteId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', 'Delete Me Other');
    });

    it('should not delete another user\'s account if not admin', async () => {
      const token = createAccessToken(
        otherUser.email,
        'user',
        otherUser.firstName,
        otherUser.lastName,
        otherUser.id,
      );

      const response = await request(server)
        .delete(`/api/v1/account/${account1.id}`)
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(200);
      response.body.should.be.empty;
    });
  });
});
