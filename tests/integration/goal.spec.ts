import chai from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import { Types } from 'mongoose';
import server from '../../src/server/server';
import { goal1, goal2, goal3, adminUser } from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager';
import goalModel from '../../src/server/resources/models/goalModel';

const resourceUrl = '/api/v1/goal';

describe('Goal', () => {
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

  describe('List Goals - GET /api/v1/goal', () => {
    it('should return the list of goals', async () => {
      const response = await request(server)
        .get(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('array');
      response.body.should.have.lengthOf(2);
    });

    it('should return nothing when user has no goals', async () => {
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
      const stub = sinon.stub(goalModel, 'find').throws(new Error('Error'));

      const response = await request(server)
        .get(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(500);
      stub.restore();
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
      response.body.should.have.property('user', adminUser.id);
    });

    it('should return empty if an category is not found', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.empty;
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/${goal1.id}`);

      response.status.should.be.eq(401);
    });

    it('should return 500 when an error occurs', async () => {
      const stub = sinon.stub(goalModel, 'findOne').throws(new Error('Error'));

      const response = await request(server)
        .get(`${resourceUrl}/${goal1.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(500);
      stub.restore();
    });
  });

  describe('Create Goal - POST /api/v1/goal/', () => {
    it('should create a goal', async () => {
      const newGoal = {
        name: 'Test Account',
        value: 400,
        dueDate: new Date(),
        user: adminUser.id,
      };

      const response = await request(server)
        .post(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newGoal);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', newGoal.name);
      response.body.should.have.property('user', newGoal.user);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .post(`${resourceUrl}`)
        .send(goal2);

      response.status.should.be.eq(401);
    });

    it('should return 500 when an error occurs', async () => {
      const stub = sinon.stub(goalModel.prototype, 'save').throws(new Error('Error'));

      const response = await request(server)
        .post(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(goal2);

      response.status.should.be.eq(500);
      stub.restore();
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

    it('should throw 500 when provided an empty object to update', async () => {
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
        .send(goal2);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', goal2.name);

      goal3.name = goal2.name;
    });

    it('should return 403 when the user is not allowed to update the goal', async () => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      const response = await request(server)
        .put(`${resourceUrl}/${goal3.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(goal2);

      response.status.should.be.eq(403);
    });

    it('should return 404 if no goal is found', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(goal2);

      response.status.should.be.eq(404);
    });

    it('should return 500 when an error occurs', async () => {
      const stub = sinon.stub(goalModel, 'findOneAndUpdate').throws(new Error('Error'));

      const response = await request(server)
        .put(`${resourceUrl}/${goal1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(goal2);

      response.status.should.be.eq(500);
      stub.restore();
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
      response.body.should.have.property('user', adminUser.id);
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
      response.body.should.have.property('user');
      response.body.user.should.not.equal(adminUser.id);
    });

    it('should return 403 when the user is not allowed to delete the goal', async () => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      const response = await request(server)
        .delete(`${resourceUrl}/${goal1.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(goal2);

      response.status.should.be.eq(403);
    });

    it('should return 404 if no goal is found', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(goal2);

      response.status.should.be.eq(404);
    });

    it('should return 500 when an error occurs', async () => {
      const stub = sinon.stub(goalModel, 'findByIdAndDelete').throws(new Error('Error'));

      const response = await request(server)
        .delete(`${resourceUrl}/${goal1.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(500);
      stub.restore();
    });
  });
});
