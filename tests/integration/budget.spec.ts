import chai from 'chai';
import sinon from 'sinon';
import { Types } from 'mongoose';
import server from '../../src/server/server';
import { budget1, budget2, budget3, adminUser } from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager';
import budgetModel from '../../src/server/resources/models/budgetModel';
import { BUDGET_TYPES } from '../../src/server/types';

const resourceUrl = '/api/v1/budget';

describe('Budget', () => {
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

  describe('List Budgets - GET /api/v1/budget', () => {
    it('should return the list of budgets', (done) => {
      chai.request(server)
        .get(resourceUrl)
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
        .get(resourceUrl)
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
        .get(resourceUrl)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(budgetModel, 'find').throws(new Error('Error'));

      chai.request(server)
        .get(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });

  describe('Retrieve Budget - GET /api/v1/budget/:id', () => {
    it('should return the budget', (done) => {
      chai.request(server)
        .get(`${resourceUrl}/${budget1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', budget1.name);
          response.body.should.have.property('value', budget1.value);
          response.body.should.have.property('type', budget1.type);
          response.body.should.have.property('startDate');
          response.body.should.have.property('endDate');
          response.body.should.have.property('categories');
          response.body.categories.should.be.an('array');
          response.body.categories.should.have.lengthOf(1);

          done();
        });
    });

    it('should return empty if an budget is not found', (done) => {
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
        .get(`${resourceUrl}/${budget1.id}`)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(budgetModel, 'findOne').throws(new Error('Error'));

      chai.request(server)
        .get(`${resourceUrl}/${budget1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });

  describe('Create Budget - POST /api/v1/budget', () => {
    it('should create a budget', (done) => {
      const newBudget = {
        name: 'New Budget',
        value: 100,
        type: BUDGET_TYPES.MONTHLY,
        startDate: new Date(),
        endDate: new Date(),
        categories: ['New Category'],
        user: adminUser.id,
      };

      chai.request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newBudget)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', newBudget.name);
          response.body.should.have.property('value', newBudget.value);
          response.body.should.have.property('type', newBudget.type);
          response.body.should.have.property('startDate', newBudget.startDate.toISOString());
          response.body.should.have.property('endDate', newBudget.endDate.toISOString());
          response.body.should.have.property('categories');
          response.body.categories.should.be.an('array');
          response.body.categories.should.have.lengthOf(1);

          done();
        });
    });

    it('should return 500 if budget has a wrong type value', (done) => {
      const newBudget = {
        name: 'New Budget',
        value: 100,
        type: 'wrong',
        startDate: new Date(),
        endDate: new Date(),
        categories: ['New Category'],
        user: adminUser.id,
      };

      chai.request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newBudget)
        .end((err, response) => {
          response.should.have.status(500);

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .post(resourceUrl)
        .send(budget2)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(budgetModel.prototype, 'save').throws(new Error('Error'));

      chai.request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(budget2)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });

  describe('Update Budget - PUT /api/v1/budget/:id', () => {
    it('should update an budget', (done) => {
      const updatedBudget = {
        name: 'Updated Budget',
        value: 200,
        type: BUDGET_TYPES.ANNUALY,
        startDate: new Date(),
        endDate: new Date(),
        categories: ['Updated Category'],
      };

      chai.request(server)
        .put(`${resourceUrl}/${budget1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedBudget)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', updatedBudget.name);
          response.body.should.have.property('value', updatedBudget.value);
          response.body.should.have.property('type', updatedBudget.type);
          response.body.should.have.property('startDate', updatedBudget.startDate.toISOString());
          response.body.should.have.property('endDate', updatedBudget.endDate.toISOString());
          response.body.should.have.property('categories');
          response.body.categories.should.be.an('array');
          response.body.categories.should.have.lengthOf(1);

          done();
        });
    });

    it('should return 500 if budget has a wrong type value', (done) => {
      const updatedBudget = {
        name: 'Updated Budget',
        value: 200,
        type: 'wrong',
        startDate: new Date(),
        endDate: new Date(),
        categories: ['Updated Category'],
      };

      chai.request(server)
        .put(`${resourceUrl}/${budget1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedBudget)
        .end((err, response) => {
          response.should.have.status(500);

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${budget1.id}`)
        .send(budget2)
        .end((err, response) => {
          response.should.have.status(401);

          done();
        });
    });

    it('should throw 500 when no information is provided', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${budget1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);

          done();
        });
    });

    it('should throw 500 when provided an empty object to update', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${budget1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .end((err, response) => {
          response.should.have.status(500);

          done();
        });
    });

    it('should be able to update another user\'s budget if is admin', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${budget3.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(budget2)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', budget2.name);
          response.body.should.have.property('value', budget2.value);
          response.body.should.have.property('type', budget2.type);
          response.body.should.have.property('startDate');
          response.body.should.have.property('endDate');
          response.body.should.have.property('categories');
          response.body.categories.should.be.an('array');
          response.body.categories.should.have.lengthOf(1);

          budget3.name = budget2.name;
          budget3.value = budget2.value;
          budget3.type = budget2.type;
          budget3.startDate = budget2.startDate;
          budget3.endDate = budget2.endDate;
          budget3.categories = budget2.categories;

          done();
        });
    });

    it('should return 403 when the user is not allowed to update the budget', (done) => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      chai.request(server)
        .put(`${resourceUrl}/${budget1.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(budget2)
        .end((err, response) => {
          response.should.have.status(403);

          done();
        });
    });

    it('should return 404 if no budget is found', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(budget2)
        .end((err, response) => {
          response.should.have.status(404);

          done();
        });
    });
  });

  describe('Delete Budget - DELETE /api/v1/budget/:id', () => {
    it('should delete a budget', (done) => {
      chai.request(server)
        .delete(`${resourceUrl}/${budget2.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', budget2.name);
          response.body.should.have.property('value', budget2.value);
          response.body.should.have.property('type', budget2.type);
          response.body.should.have.property('startDate');
          response.body.should.have.property('endDate');
          response.body.should.have.property('categories');
          response.body.categories.should.be.an('array');
          response.body.categories.should.have.lengthOf(1);

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .delete(`${resourceUrl}/${budget1.id}`)
        .end((err, response) => {
          response.should.have.status(401);

          done();
        });
    });

    it('should be able to delete another user\'s budget if is admin', (done) => {
      chai.request(server)
        .delete(`${resourceUrl}/${budget3.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', budget3.name);
          response.body.should.have.property('value', budget3.value);
          response.body.should.have.property('type', budget3.type);
          response.body.should.have.property('startDate');
          response.body.should.have.property('endDate');
          response.body.should.have.property('categories');
          response.body.categories.should.be.an('array');
          response.body.categories.should.have.lengthOf(1);

          done();
        });
    });

    it('should return 403 when the user is not allowed to delete the budget', (done) => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      chai.request(server)
        .delete(`${resourceUrl}/${budget1.id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, response) => {
          response.should.have.status(403);

          done();
        });
    });

    it('should return 404 if no budget is found', (done) => {
      chai.request(server)
        .delete(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(404);

          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(budgetModel, 'findByIdAndDelete').throws(new Error('Error'));

      chai.request(server)
        .delete(`${resourceUrl}/${budget1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();

          done();
        });
    });
  });
});
