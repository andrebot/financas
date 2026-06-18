import request from 'supertest';
import server from '../../src/server/server';
import {
  transaction1, transaction2, transaction3, account1, adminUser, userToDelete, goal1,
  findMonthlyBalancesByAccountId,
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

    it('should include accountName and categoryName in each transaction', async () => {
      const response = await request(server)
        .get(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`);

      const t1 = response.body.find((t: any) => t.id === transaction1.id);
      response.status.should.be.eq(200);
      t1.should.have.property('accountName').that.is.a('string');
      t1.should.have.property('categoryName', null);
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
          goalId: goal1.id,
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

  describe('List Monthly Balances - GET /api/v1/accountant/monthly-balance', () => {
    const testDate = new Date('2026-03-10');
    let testAccountId: number;

    before(async () => {
      const token = createAccessToken(
        adminUser.email, 'admin', adminUser.firstName, adminUser.lastName, adminUser.id,
      );
      const accountRes = await request(server)
        .post('/api/v1/account')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Monthly Balance Test Account',
          agency: '8881',
          accountNumber: '888111',
          currency: 'BRL',
          initialBalance: '0.00',
          userId: adminUser.id,
        });
      testAccountId = accountRes.body.id;

      await request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Monthly Balance Test Txn',
          accountId: testAccountId,
          type: 'deposit',
          date: testDate,
          value: '400.00',
          userId: adminUser.id,
        });
    });

    it('should return monthly balances for the given year and month', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/monthly-balance?year=2026&month=3`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('array');
      const balance = response.body.find((b: any) => b.accountId === testAccountId);
      balance.should.exist;
      balance.should.have.property('year', 2026);
      balance.should.have.property('month', 3);
      Number(balance.closingBalance).should.equal(400);
    });

    it('should return an empty array when no balances exist for the period', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/monthly-balance?year=1999&month=1`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('array');
      response.body.should.have.lengthOf(0);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/monthly-balance?year=2026&month=3`);

      response.status.should.be.eq(401);
    });
  });

  describe('Monthly Balance Side Effects', () => {
    let sideEffectAccountId: number;

    before(async () => {
      const token = createAccessToken(
        adminUser.email, 'admin', adminUser.firstName, adminUser.lastName, adminUser.id,
      );
      const accountRes = await request(server)
        .post('/api/v1/account')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Side Effect Test Account',
          agency: '7771',
          accountNumber: '777111',
          currency: 'BRL',
          initialBalance: '0.00',
          userId: adminUser.id,
        });
      sideEffectAccountId = accountRes.body.id;
    });

    it('should create a monthly balance record when a transaction is posted', async () => {
      const response = await request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Side Effect Txn',
          accountId: sideEffectAccountId,
          type: 'deposit',
          date: new Date('2026-05-20'),
          value: '150.00',
          userId: adminUser.id,
        });

      const balances = await findMonthlyBalancesByAccountId(sideEffectAccountId);

      response.status.should.be.eq(200);
      balances.should.have.lengthOf(1);
      balances[0].should.have.property('year', 2026);
      balances[0].should.have.property('month', 5);
      Number(balances[0].closingBalance).should.equal(150);
      Number(balances[0].openingBalance).should.equal(0);
    });

    it('should revert the monthly balance when the transaction is deleted', async () => {
      const createRes = await request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Txn To Delete',
          accountId: sideEffectAccountId,
          type: 'withdraw',
          date: new Date('2026-05-25'),
          value: '50.00',
          userId: adminUser.id,
        });

      const balancesAfterCreate = await findMonthlyBalancesByAccountId(sideEffectAccountId);
      Number(balancesAfterCreate[0].closingBalance).should.equal(100);

      await request(server)
        .delete(`${resourceUrl}/${createRes.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      const balancesAfterDelete = await findMonthlyBalancesByAccountId(sideEffectAccountId);
      Number(balancesAfterDelete[0].closingBalance).should.equal(150);
    });
  });
});
