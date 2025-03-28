import chai from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import { Types } from 'mongoose';
import server from '../../src/server/server';
import { category1, category2, category3, adminUser } from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager';
import categoryModel from '../../src/server/resources/models/categoryModel';

const resourceUrl = '/api/v1/category';

describe('Category', () => {
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

  describe('List Categories - GET /api/v1/category', () => {
    it('should return the list of categories', async () => {
      const response = await request(server)
        .get(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('array');
      response.body.should.have.lengthOf(2);
    });

    it('should return nothing when user has no categories', async () => {
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
      const stub = sinon.stub(categoryModel, 'find').throws(new Error('Error'));

      const response = await request(server)
        .get(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(500);
      stub.restore();
    });
  });

  describe('Retrieve Category - GET /api/v1/category/:id', () => {
    it('should return the category', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/${category1.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', category1.name);
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
        .get(`${resourceUrl}/${category1.id}`);

      response.status.should.be.eq(401);
    });

    it('should return 500 when an error occurs', async () => {
      const stub = sinon.stub(categoryModel, 'findOne').throws(new Error('Error'));

      const response = await request(server)
        .get(`${resourceUrl}/${category1.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(500);
      stub.restore();
    });
  });

  describe('Create Category - POST /api/v1/category/', () => {
    it('should create a category', async () => {
      const newCategory = {
        name: 'Test Account',
        user: adminUser.id,
      };

      const response = await request(server)
        .post(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newCategory);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', newCategory.name);
      response.body.should.have.property('user', newCategory.user);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .post(`${resourceUrl}`)
        .send(category2);

      response.status.should.be.eq(401);
    });

    it('should return 500 when an error occurs', async () => {
      const stub = sinon.stub(categoryModel.prototype, 'save').throws(new Error('Error'));

      const response = await request(server)
        .post(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(category2);

      response.status.should.be.eq(500);
      stub.restore();
    });
  });

  describe('Update Category - PUT /api/v1/category/:id', () => {
    it('should update a category', async () => {
      const updatedCategory = {
        name: 'Updated Account',
      };

      const response = await request(server)
        .put(`${resourceUrl}/${category1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedCategory);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', updatedCategory.name);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${category1.id}`)
        .send(category2);

      response.status.should.be.eq(401);
    });

    it('should throw 500 when no information is provided', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${category1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      response.status.should.be.eq(500);
    });

    it('should throw 500 when provided an empty object to update', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${category1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      response.status.should.be.eq(500);
    });

    it('should be able to update another user\'s category if is admin', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${category3.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(category2);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', category2.name);

      category3.name = category2.name;
    });

    it('should return 403 when the user is not allowed to update the category', async () => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      const response = await request(server)
        .put(`${resourceUrl}/${category3.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(category2);

      response.status.should.be.eq(403);
    });

    it('should return 404 if no category is found', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(category2);

      response.status.should.be.eq(404);
    });
  });

  describe('Delete Category - DELETE /api/v1/category/:id', () => {
    it('should delete a category', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${category2.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', category2.name);
      response.body.should.have.property('user', adminUser.id);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${category1.id}`);

      response.status.should.be.eq(401);
    });

    it('should be able to delete another user\'s category if is admin', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${category3.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', category3.name);
      response.body.should.have.property('user');
      response.body.user.should.not.equal(adminUser.id);
    });

    it('should return 403 when the user is not allowed to delete the category', async () => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      const response = await request(server)
        .delete(`${resourceUrl}/${category1.id}`)
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(403);
    });

    it('should return 404 if no category is found', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(404);
    });

    it('should return 500 when an error occurs', async () => {
      const stub = sinon.stub(categoryModel, 'findByIdAndDelete').throws(new Error('Error'));

      const response = await request(server)
        .delete(`${resourceUrl}/${category1.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(500);
      stub.restore();
    });
  });
});
