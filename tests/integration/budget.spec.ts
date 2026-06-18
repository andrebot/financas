import request from 'supertest';
import server from '../../src/server/server';
import {
  budget1,
  budget3,
  adminUser,
  userToDelete,
  otherUser,
  category1,
  category3,
} from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager';

const resourceUrl = '/api/v1/budget';

describe('Budget', () => {
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

  describe('List Budgets - GET /api/v1/budget', () => {
    it('should return all budgets when user is admin', async () => {
      const response = await request(server)
        .get(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('array');
      response.body.should.have.lengthOf(3);
    });

    it('should return budgets with hydrated categories', async () => {
      const response = await request(server)
        .get(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`);

      const firstBudget = response.body.find((budget: typeof budget1) => budget.id === budget1.id);
      const otherBudget = response.body.find((budget: typeof budget3) => budget.id === budget3.id);

      response.status.should.be.eq(200);
      firstBudget.should.have.property('categories').that.is.an('array').with.lengthOf(1);
      firstBudget.categories[0].should.deep.include({
        id: category1.id,
        name: category1.name,
      });
      otherBudget.should.have.property('categories').that.is.an('array').with.lengthOf(0);
    });

    it('should include a spent field on each budget', async () => {
      const response = await request(server)
        .get(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`);

      const firstBudget = response.body.find((budget: typeof budget1) => budget.id === budget1.id);

      response.status.should.be.eq(200);
      firstBudget.should.have.property('spent', 0);
      response.body.forEach((budget: any) => {
        budget.should.have.property('spent');
      });
    });

    it('should return nothing when user has no budgets', async () => {
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

  describe('Retrieve Budget - GET /api/v1/budget/:id', () => {
    it('should return the budget', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/${budget1.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', budget1.name);
      response.body.should.have.property('value', budget1.value);
      response.body.should.have.property('type', budget1.type);
      response.body.should.have.property('startDate');
      response.body.should.have.property('endDate');
    });

    it('should return empty if a budget is not found', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/999999`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.empty;
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/${budget1.id}`);

      response.status.should.be.eq(401);
    });
  });

  describe('Create Budget - POST /api/v1/budget', () => {
    it('should create a budget', async () => {
      const newBudget = {
        name: 'New Budget',
        value: '200.00',
        type: 'monthly',
        startDate: new Date(),
        endDate: new Date(),
        userId: adminUser.id,
        categoryIds: [category1.id],
      };

      const response = await request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newBudget);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', newBudget.name);
      response.body.should.have.property('type', newBudget.type);
      response.body.should.have.property('startDate');
      response.body.should.have.property('endDate');
    });

    it('should reject budget creation without category ids', async () => {
      const newBudget = {
        name: 'New Budget Without Categories',
        value: '200.00',
        type: 'monthly',
        startDate: new Date(),
        endDate: new Date(),
        userId: adminUser.id,
      };

      const response = await request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newBudget);

      response.status.should.be.eq(500);
      response.body.should.have.property('error', 'Budget requires at least one category');
    });

    it('should create a budget and persist its category links', async () => {
      const newBudget = {
        name: 'New Category Budget',
        value: '250.00',
        type: 'monthly',
        startDate: new Date(),
        endDate: new Date(),
        userId: adminUser.id,
        categoryIds: [category1.id],
      };

      const createResponse = await request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newBudget);

      const listResponse = await request(server)
        .get(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`);
      const createdBudget = listResponse.body.find(
        (budget: typeof budget1) => budget.id === createResponse.body.id,
      );

      createResponse.status.should.be.eq(200);
      createResponse.body.should.deep.include({
        name: newBudget.name,
        categoryIds: newBudget.categoryIds,
      });
      createdBudget.should.have.property('categories').that.is.an('array').with.lengthOf(1);
      createdBudget.categories[0].should.deep.include({
        id: category1.id,
        name: category1.name,
      });
    });

    it('should reject budget creation when category ids are not visible to the user', async () => {
      const token = createAccessToken(
        userToDelete.email,
        'user',
        userToDelete.firstName,
        userToDelete.lastName,
        userToDelete.id,
      );
      const newBudget = {
        name: 'Invalid Category Budget',
        value: '200.00',
        type: 'monthly',
        startDate: new Date(),
        endDate: new Date(),
        userId: userToDelete.id,
        categoryIds: [category1.id],
      };

      const response = await request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${token}`)
        .send(newBudget);

      response.status.should.be.eq(500);
      response.body.should.have.property('error', 'Budget contains invalid categories');
    });

    it('should return 500 if budget has a wrong type value', async () => {
      const newBudget = {
        name: 'New Budget',
        value: '200.00',
        type: 'wrong',
        startDate: new Date(),
        endDate: new Date(),
        userId: adminUser.id,
      };

      const response = await request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newBudget);

      response.status.should.be.eq(500);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .post(resourceUrl)
        .send(budget3);

      response.status.should.be.eq(401);
    });
  });

  describe('Update Budget - PUT /api/v1/budget/:id', () => {
    it('should update a budget', async () => {
      const updatedBudget = {
        name: 'Updated Budget',
        value: '200.00',
        type: 'annualy',
        startDate: new Date(),
        endDate: new Date(),
      };

      const response = await request(server)
        .put(`${resourceUrl}/${budget1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedBudget);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', updatedBudget.name);
      response.body.should.have.property('value', updatedBudget.value);
      response.body.should.have.property('type', updatedBudget.type);
      response.body.should.have.property('startDate');
      response.body.should.have.property('endDate');
    });

    it('should skip budget update when category ids are empty', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${budget1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Skipped Empty Category Update', categoryIds: [] });

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('id', budget1.id);
      response.body.should.not.have.property('name', 'Skipped Empty Category Update');
    });

    it('should return 500 if budget has a wrong type value', async () => {
      const updatedBudget = {
        name: 'Updated Budget',
        value: '200.00',
        type: 'wrong',
        startDate: new Date(),
        endDate: new Date(),
      };

      const response = await request(server)
        .put(`${resourceUrl}/${budget1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedBudget);

      response.status.should.be.eq(500);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${budget1.id}`)
        .send(budget3);

      response.status.should.be.eq(401);
    });

    it('should throw 500 when no information is provided', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${budget1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      response.status.should.be.eq(500);
    });

    it('should be able to update another user\'s budget if is admin', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${budget3.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Admin Updated Budget' });

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', 'Admin Updated Budget');

      budget3.name = 'Admin Updated Budget';
    });

    it('should not update another user\'s budget if not admin', async () => {
      const token = createAccessToken(
        userToDelete.email,
        'user',
        userToDelete.firstName,
        userToDelete.lastName,
        userToDelete.id,
      );

      const response = await request(server)
        .put(`${resourceUrl}/${budget3.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Stolen Update' });

      response.status.should.be.eq(200);
      response.body.should.be.empty;
    });
  });

  describe('Delete Budget - DELETE /api/v1/budget/:id', () => {
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
        .post(resourceUrl)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Delete Me Own',
          value: '50.00',
          type: 'monthly',
          startDate: new Date(),
          endDate: new Date(),
          userId: adminUser.id,
          categoryIds: [category1.id],
        });
      ownDeleteId = ownRes.body.id;

      const otherRes = await request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          name: 'Delete Me Other',
          value: '75.00',
          type: 'weekly',
          startDate: new Date(),
          endDate: new Date(),
          userId: otherUser.id,
          categoryIds: [category3.id],
        });
      otherDeleteId = otherRes.body.id;
    });

    it('should delete a budget', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${ownDeleteId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', 'Delete Me Own');
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${budget1.id}`);

      response.status.should.be.eq(401);
    });

    it('should be able to delete another user\'s budget if is admin', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${otherDeleteId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', 'Delete Me Other');
    });

    it('should not delete another user\'s budget if not admin', async () => {
      const token = createAccessToken(
        otherUser.email,
        'user',
        otherUser.firstName,
        otherUser.lastName,
        otherUser.id,
      );

      const response = await request(server)
        .delete(`${resourceUrl}/${budget1.id}`)
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(200);
      response.body.should.be.empty;
    });
  });
});
