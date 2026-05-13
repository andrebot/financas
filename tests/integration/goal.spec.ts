import request from 'supertest';
import server from '../../src/server/server';
import {
  goal1, goal2, goal3, adminUser, userToDelete,
} from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager';

const resourceUrl = '/api/v1/goal';

describe('Goal', () => {
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

  describe('List Goals - GET /api/v1/goal', () => {
    it('should return all goals when user is admin', async () => {
      const response = await request(server)
        .get(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('array');
      response.body.should.have.lengthOf(3);
    });

    it('should return nothing when user has no goals', async () => {
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

  describe('Retrieve Goal - GET /api/v1/goal/:id', () => {
    it('should return the goal', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/${goal1.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', goal1.name);
      response.body.should.have.property('value', goal1.value);
      response.body.should.have.property('dueDate', goal1.dueDate.toISOString());
      response.body.should.have.property('userId', adminUser.id);
    });

    it('should return empty if a goal is not found', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/999999`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.empty;
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/${goal1.id}`);

      response.status.should.be.eq(401);
    });
  });

  describe('Create Goal - POST /api/v1/goal/', () => {
    it('should create a goal', async () => {
      const newGoal = {
        name: 'Test Goal',
        value: 400,
        savedValue: '0',
        dueDate: new Date(),
        userId: adminUser.id,
      };

      const response = await request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newGoal);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', newGoal.name);
      response.body.should.have.property('userId', newGoal.userId);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .post(resourceUrl)
        .send(goal2);

      response.status.should.be.eq(401);
    });
  });

  describe('Update Goal - PUT /api/v1/goal/:id', () => {
    it('should update a goal', async () => {
      const updatedGoal = {
        name: 'Updated Goal',
      };

      const response = await request(server)
        .put(`${resourceUrl}/${goal1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedGoal);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', updatedGoal.name);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${goal1.id}`)
        .send(goal2);

      response.status.should.be.eq(401);
    });

    it('should throw 500 when no information is provided', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${goal1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      response.status.should.be.eq(500);
    });

    it('should be able to update another user\'s goal if is admin', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${goal3.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: goal2.name });

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', goal2.name);

      goal3.name = goal2.name;
    });

    it('should not update another user\'s goal if not admin', async () => {
      const token = createAccessToken(
        userToDelete.email,
        'user',
        userToDelete.firstName,
        userToDelete.lastName,
        userToDelete.id,
      );

      const response = await request(server)
        .put(`${resourceUrl}/${goal3.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Stolen Update' });

      response.status.should.be.eq(200);
      response.body.should.be.empty;
    });
  });

  describe('Delete Goal - DELETE /api/v1/goal/:id', () => {
    it('should delete a goal', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${goal2.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', goal2.name);
      response.body.should.have.property('userId', adminUser.id);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${goal1.id}`);

      response.status.should.be.eq(401);
    });

    it('should be able to delete another user\'s goal if is admin', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${goal3.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', goal3.name);
      response.body.userId.should.not.equal(adminUser.id);
    });

    it('should return 404 when deleting a non-existent goal', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/999999`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(404);
      response.body.should.have.property('error').that.includes('not found');
    });

    it('should not delete another user\'s goal if not admin', async () => {
      const token = createAccessToken(
        userToDelete.email,
        'user',
        userToDelete.firstName,
        userToDelete.lastName,
        userToDelete.id,
      );

      const response = await request(server)
        .delete(`${resourceUrl}/${goal1.id}`)
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(404);
    });
  });
});
