import request from 'supertest';
import server from '../../src/server/server';
import {
  transaction1, transaction2, transaction3, account1, adminUser, userToDelete, goal1,
} from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager';
import { TRANSACTION_TYPES, INVESTMENT_TYPES } from '../../src/server/types';

const resourceUrl = '/api/v1/accountant';

describe('Transactions', () => {
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

  describe('List Transactions - GET /api/v1/accountant', () => {
    it('should return all transactions when user is admin', async () => {
      const response = await request(server)
        .get(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('array');
      response.body.should.have.lengthOf(3);
    });

    it('should return nothing when user has no transactions', async () => {
      const token = createAccessToken(
        userToDelete.email,
        'user',
        userToDelete.firstName,
        userToDelete.lastName,
        userToDelete.id,
      );

      const response = await request(server)
        .get(resourceUrl)
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('array');
      response.body.should.have.lengthOf(0);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .get(resourceUrl);

      response.status.should.be.eq(401);
    });
  });

  describe('Retrieve Transaction - GET /api/v1/accountant/:id', () => {
    it('should return the transaction', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/${transaction1.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', transaction1.name);
      response.body.should.have.property('type', transaction1.type);
      response.body.should.have.property('date', (transaction1.date as Date).toISOString());
      response.body.should.have.property('value', transaction1.value);
      response.body.should.have.property('userId', adminUser.id);
    });

    it('should return empty if a transaction is not found', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/999999`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.empty;
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/${transaction1.id}`);

      response.status.should.be.eq(401);
    });
  });

  describe('Create Transaction - POST /api/v1/accountant/', () => {
    it('should create a transaction', async () => {
      const newTransaction = {
        name: 'New Transaction',
        accountId: account1.id,
        type: 'deposit',
        date: new Date(),
        value: '100.00',
        userId: adminUser.id,
      };

      const response = await request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newTransaction);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', newTransaction.name);
      response.body.should.have.property('userId', newTransaction.userId);
    });

    it('should create a transaction with goals', async () => {
      const newTransaction = {
        name: 'Transaction With Goal',
        accountId: account1.id,
        type: 'deposit',
        date: new Date(),
        value: '50.00',
        userId: adminUser.id,
        goals: [{
          goal: goal1.id,
          percentage: '0.50',
        }],
      };

      const response = await request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newTransaction);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', newTransaction.name);
      response.body.should.have.property('userId', newTransaction.userId);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .post(resourceUrl)
        .send(transaction2);

      response.status.should.be.eq(401);
    });
  });

  describe('Update Transaction - PUT /api/v1/accountant/:id', () => {
    it('should update a transaction', async () => {
      const updatedTransaction = {
        name: 'Updated Transaction',
      };

      const response = await request(server)
        .put(`${resourceUrl}/${transaction1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedTransaction);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', updatedTransaction.name);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${transaction1.id}`)
        .send({ name: 'fail' });

      response.status.should.be.eq(401);
    });

    it('should throw 500 when no information is provided', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${transaction1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      response.status.should.be.eq(500);
    });

    it('should be able to update another user\'s transaction if is admin', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${transaction3.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Admin Updated Transaction' });

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', 'Admin Updated Transaction');

      transaction3.name = 'Admin Updated Transaction';
    });

    it('should return 404 when the user is not allowed to update the transaction', async () => {
      const token = createAccessToken(
        userToDelete.email,
        'user',
        userToDelete.firstName,
        userToDelete.lastName,
        userToDelete.id,
      );

      const response = await request(server)
        .put(`${resourceUrl}/${transaction3.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Stolen Update' });

      response.status.should.be.eq(404);
      response.body.should.have.property('error').that.includes('not found');
    });
  });

  describe('Delete Transaction - DELETE /api/v1/accountant/:id', () => {
    it('should delete a transaction', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${transaction2.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', transaction2.name);
      response.body.should.have.property('userId', adminUser.id);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${transaction1.id}`);

      response.status.should.be.eq(401);
    });

    it('should be able to delete another user\'s transaction if is admin', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${transaction3.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', transaction3.name);
      response.body.userId.should.not.equal(adminUser.id);
    });

    it('should return 404 when the user is not allowed to delete the transaction', async () => {
      const token = createAccessToken(
        userToDelete.email,
        'user',
        userToDelete.firstName,
        userToDelete.lastName,
        userToDelete.id,
      );

      const response = await request(server)
        .delete(`${resourceUrl}/${transaction1.id}`)
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(404);
      response.body.should.have.property('error').that.includes('not found');
    });

    it('should return 404 if no transaction is found', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/999999`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(404);
      response.body.should.have.property('error').that.includes('not found');
    });
  });

  describe('List Transaction types - GET /api/v1/accountant/types', () => {
    it('should return the list of transaction types', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/types`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('transactionTypes');
      response.body.transactionTypes.should.be.an('array');
      response.body.transactionTypes.should.have.lengthOf(TRANSACTION_TYPES.length);
      response.body.should.have.property('investmentTypes');
      response.body.investmentTypes.should.be.an('array');
      response.body.investmentTypes.should.have.lengthOf(INVESTMENT_TYPES.length);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/types`);

      response.status.should.be.eq(401);
    });
  });
});
