import chai from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import { Types } from 'mongoose';
import server from '../../src/server/server';
import { transaction1, transaction2, transaction3, account1, adminUser } from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager';
import transactionModel from '../../src/server/resources/models/transactionModel';
import { INVESTMENT_TYPES, TRANSACTION_TYPES } from '../../src/server/types';

const resourceUrl = '/api/v1/transaction';

describe('Transactions', () => {
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

  describe('List Transactions - GET /api/v1/transaction', () => {
    it('should return the list of transactions', async () => {
      const response = await request(server)
        .get(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('array');
      response.body.should.have.lengthOf(2);
    });

    it('should return nothing when user has no transactions', async () => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      const response = await request(server)
        .get(`${resourceUrl}`)
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('array');
      response.body.should.have.lengthOf(0);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .get(`${resourceUrl}`);

      response.status.should.be.eq(401);
    });

    it('should return 500 when an error occurs', async () => {
      const stub = sinon.stub(transactionModel, 'find').throws(new Error('Error'));

      const response = await request(server)
        .get(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(500);
      stub.restore();
    });
  });

  describe('Retrieve Transaction - GET /api/v1/transaction/:id', () => {
    it('should return the transaction', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/${transaction1.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', transaction1.name);
      response.body.should.have.property('category', transaction1.category);
      response.body.should.have.property('parentCategory', transaction1.parentCategory);
      response.body.should.have.property('type', transaction1.type);
      response.body.should.have.property('date', (transaction1.date as Date).toISOString());
      response.body.should.have.property('value', transaction1.value);
      response.body.should.have.property('user', adminUser.id);
    });

    it('should return empty if a transaction is not found', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.empty;
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/${transaction1.id}`);

      response.status.should.be.eq(401);
    });

    it('should return 500 when an error occurs', async () => {
      const stub = sinon.stub(transactionModel, 'findOne').throws(new Error('Error'));

      const response = await request(server)
        .get(`${resourceUrl}/${transaction1.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(500);
      stub.restore();
    });
  });

  describe('Create Transaction - POST /api/v1/transaction/', () => {
    it('should create a transaction', async () => {
      const newTransaction = {
        name: 'New Transaction',
        category: 'New Category',
        parentCategory: 'New Parent Category',
        account: account1.id,
        type: TRANSACTION_TYPES.TRANSFER,
        date: new Date(),
        value: 100,
        user: adminUser.id,
      };

      const response = await request(server)
        .post(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newTransaction);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', newTransaction.name);
      response.body.should.have.property('user', newTransaction.user);
    });

    it('should create a transaction with goals', async () => {
      const newTransaction = {
        name: 'New Transaction',
        category: 'New Category',
        parentCategory: 'New Parent Category',
        account: account1.id,
        type: TRANSACTION_TYPES.TRANSFER,
        date: new Date(),
        value: 100,
        user: adminUser.id,
        InvestmentType: INVESTMENT_TYPES.LCI,
        goalsList: [{
          goal: new Types.ObjectId().toString(),
          goalName: 'Test Goal 1',
          percentage: 0.5,
        }],
      };

      const response = await request(server)
        .post(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newTransaction);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', newTransaction.name);
      response.body.should.have.property('user', newTransaction.user);
      response.body.should.have.property('goalsList');
      response.body.goalsList.should.be.an('array');
      response.body.goalsList.should.have.lengthOf(1);
      response.body.goalsList[0].should.have.property('goal');
      response.body.goalsList[0].should.have.property('goalName');
      response.body.goalsList[0].should.have.property('percentage');
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .post(`${resourceUrl}`)
        .send(transaction2);

      response.status.should.be.eq(401);
    });

    it('should return 500 when an error occurs', async () => {
      const stub = sinon.stub(transactionModel.prototype, 'save').throws(new Error('Error'));

      const response = await request(server)
        .post(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transaction2);

      response.status.should.be.eq(500);
      stub.restore();
    });
  });

  describe('Update Transaction - PUT /api/v1/transaction/:id', () => {
    it('should update a goal', async () => {
      const updatedTransaction = {
        name: 'Updated Goal',
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
        .send(transaction2);

      response.status.should.be.eq(401);
    });

    it('should throw 500 when no information is provided', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${transaction1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      response.status.should.be.eq(500);
    });

    it('should throw 500 when provided an empty object to update', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${transaction1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      response.status.should.be.eq(500);
    });

    it('should be able to update another user\'s transaction if is admin', async () => {
      const transaction2Copy = { ...transaction2 } as Partial<typeof transaction2>;
      delete transaction2Copy.goalsList;

      const response = await request(server)
        .put(`${resourceUrl}/${transaction3.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transaction2Copy);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', transaction2Copy.name);

      transaction3.name = transaction2Copy.name!;
      transaction3.category = transaction2Copy.category!;
      transaction3.parentCategory = transaction2Copy.parentCategory!;
      transaction3.account = transaction2Copy.account!;
      transaction3.type = transaction2Copy.type!;
      transaction3.date = transaction2Copy.date!;
      transaction3.value = transaction2Copy.value!;
    });

    it('should return 403 when the user is not allowed to update the transaction', async () => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      const response = await request(server)
        .put(`${resourceUrl}/${transaction3.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(transaction2);

      response.status.should.be.eq(403);
    });

    it('should return 404 if no transaction is found', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transaction2);

      response.status.should.be.eq(404);
    });
  });

  describe('Delete Goal - DELETE /api/v1/transaction/:id', () => {
    it('should delete a transaction', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${transaction2.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', transaction2.name);
      response.body.should.have.property('user', adminUser.id);
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
      response.body.should.have.property('user');
      response.body.user.should.not.equal(adminUser.id);
    });

    it('should return 403 when the user is not allowed to delete the transaciton', async () => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      const response = await request(server)
        .delete(`${resourceUrl}/${transaction1.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(transaction2);

      response.status.should.be.eq(403);
    });

    it('should return 404 if no transaction is found', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transaction2);

      response.status.should.be.eq(404);
    });

    it('should return 500 when an error occurs', async () => {
      const stub = sinon.stub(transactionModel, 'findByIdAndDelete').throws(new Error('Error'));

      const response = await request(server)
        .delete(`${resourceUrl}/${transaction1.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(500);
      stub.restore();
    });
  });

  describe('List Transaction types - GET /api/v1/transaction/types', () => {
    it('should return the list of transaction types', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/types`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('transactionTypes');
      response.body.transactionTypes.should.be.an('array');
      response.body.transactionTypes.should.have.lengthOf(Object.values(TRANSACTION_TYPES).length);
      response.body.should.have.property('investmentTypes');
      response.body.investmentTypes.should.be.an('array');
      response.body.investmentTypes.should.have.lengthOf(Object.values(INVESTMENT_TYPES).length);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/types`);

      response.status.should.be.eq(401);
    });
  });
});
