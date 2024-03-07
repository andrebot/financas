import chai from 'chai';
import sinon from 'sinon';
import { Types } from 'mongoose';
import server from '../../src/server/server';
import { transaction1, transaction2, transaction3, account1, adminUser } from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager';
import transactionModel, { INVESTMENT_TYPES, TRANSACTION_TYPES } from '../../src/server/resources/transactionModel';

const resourceUrl = '/api/v1/transaction';

describe('Goal', () => {
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

  describe('List Transactions - GET /api/v1/transaction', () => {
    it('should return the list of transactions', (done) => {
      chai.request(server)
        .get(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.have.lengthOf(2);

          done();
        });
    });

    it('should return nothing when user has no transactions', (done) => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      chai.request(server)
        .get(`${resourceUrl}`)
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
        .get(`${resourceUrl}`)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(transactionModel, 'find').throws(new Error('Error'));

      chai.request(server)
        .get(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });

  describe('Retrieve Transaction - GET /api/v1/transaction/:id', () => {
    it('should return the transaction', (done) => {
      chai.request(server)
        .get(`${resourceUrl}/${transaction1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', transaction1.name);
          response.body.should.have.property('category', transaction1.category);
          response.body.should.have.property('parentCategory', transaction1.parentCategory);
          response.body.should.have.property('type', transaction1.type);
          response.body.should.have.property('date', transaction1.date.toISOString());
          response.body.should.have.property('value', transaction1.value);
          response.body.should.have.property('isCredit', transaction1.isCredit);
          response.body.should.have.property('user', adminUser._id.toString());

          done();
        });
    });

    it('should return empty if a transaction is not found', (done) => {
      chai.request(server)
        .get(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          chai.expect(response.body).to.be.empty;

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .get(`${resourceUrl}/${transaction1._id}`)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(transactionModel, 'findById').throws(new Error('Error'));

      chai.request(server)
        .get(`${resourceUrl}/${transaction1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });

  describe('Create Transaction - POST /api/v1/transaction/', () => {
    it('should create a transaction', (done) => {
      const newTransaction = {
        name: 'New Transaction',
        category: 'New Category',
        parentCategory: 'New Parent Category',
        account: account1._id,
        type: TRANSACTION_TYPES.TRANSFER,
        date: new Date(),
        value: 100,
        isCredit: false,
        user: adminUser._id,
      };

      chai.request(server)
        .post(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newTransaction)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', newTransaction.name);
          response.body.should.have.property('user', newTransaction.user.toString());

          done();
        });
    });

    it('should create a transaction with goals', (done) => {
      const newTransaction = {
        name: 'New Transaction',
        category: 'New Category',
        parentCategory: 'New Parent Category',
        account: account1._id,
        type: TRANSACTION_TYPES.TRANSFER,
        date: new Date(),
        value: 100,
        isCredit: false,
        user: adminUser._id,
        InvestmentType: INVESTMENT_TYPES.LCI,
        goalsList: [{
          goal: new Types.ObjectId(),
          goalName: 'Test Goal 1',
          percentage: 0.5,
        }],
      };

      chai.request(server)
        .post(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newTransaction)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', newTransaction.name);
          response.body.should.have.property('user', newTransaction.user.toString());
          response.body.should.have.property('goalsList');
          response.body.goalsList.should.be.an('array');
          response.body.goalsList.should.have.lengthOf(1);
          response.body.goalsList[0].should.have.property('goal');
          response.body.goalsList[0].should.have.property('goalName');
          response.body.goalsList[0].should.have.property('percentage');

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .post(`${resourceUrl}`)
        .send(transaction2)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(transactionModel.prototype, 'save').throws(new Error('Error'));

      chai.request(server)
        .post(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transaction2)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });

  describe('Update Transaction - PUT /api/v1/transaction/:id', () => {
    it('should update a goal', (done) => {
      const updatedTransaction = {
        name: 'Updated Goal',
      };

      chai.request(server)
        .put(`${resourceUrl}/${transaction1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedTransaction)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', updatedTransaction.name);

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${transaction1._id}`)
        .send(transaction2)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should throw 500 when no information is provided', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${transaction1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          done();
        });
    });

    it('should throw 500 when provided an empty object to update', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${transaction1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .end((err, response) => {
          response.should.have.status(500);
          done();
        });
    });

    it('should be able to update another user\'s transaction if is admin', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${transaction3._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transaction2)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', transaction2.name);

          done();
        });
    });

    it('should return 403 when the user is not allowed to update the transaction', (done) => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      chai.request(server)
        .put(`${resourceUrl}/${transaction3._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(transaction2)
        .end((err, response) => {
          response.should.have.status(403);
          done();
        });
    });

    it('should return 500 if no transaction is found', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transaction2)
        .end((err, response) => {
          response.should.have.status(500);
          done();
        });
    });
  });

  describe('Delete Goal - DELETE /api/v1/transaction/:id', () => {
    it('should delete a transaction', (done) => {
      chai.request(server)
        .delete(`${resourceUrl}/${transaction2._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', transaction2.name);
          response.body.should.have.property('user', adminUser._id.toString());

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .delete(`${resourceUrl}/${transaction1._id}`)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should be able to delete another user\'s transaction if is admin', (done) => {
      chai.request(server)
        .delete(`${resourceUrl}/${transaction3._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', transaction3.name);
          response.body.should.have.property('user');
          response.body.user.should.not.equal(adminUser._id.toString());

          done();
        });
    });

    it('should return 403 when the user is not allowed to delete the transaciton', (done) => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      chai.request(server)
        .delete(`${resourceUrl}/${transaction1._id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, response) => {
          response.should.have.status(403);
          done();
        });
    });

    it('should return 500 if no transaction is found', (done) => {
      chai.request(server)
        .delete(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(transactionModel, 'findByIdAndDelete').throws(new Error('Error'));

      chai.request(server)
        .delete(`${resourceUrl}/${transaction1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });

  describe('List Transaction types - GET /api/v1/transaction/types', () => {
    it('should return the list of transaction types', (done) => {
      chai.request(server)
        .get(`${resourceUrl}/types`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          console.log(err)
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('transactionTypes');
          response.body.transactionTypes.should.be.an('array');
          response.body.transactionTypes.should.have.lengthOf(Object.values(TRANSACTION_TYPES).length);
          response.body.should.have.property('investmentTypes');
          response.body.investmentTypes.should.be.an('array');
          response.body.investmentTypes.should.have.lengthOf(Object.values(INVESTMENT_TYPES).length);

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .get(`${resourceUrl}/types`)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });
  });
});
