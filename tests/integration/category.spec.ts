import request from 'supertest';
import server from '../../src/server/server';
import {
  category1, category2, category3, adminUser, userToDelete, otherUser,
  createCategory, account1,
} from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager';

const resourceUrl = '/api/v1/category';

describe('Category', () => {
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

  describe('List Categories - GET /api/v1/category', () => {
    it('should return all categories when user is admin', async () => {
      const response = await request(server)
        .get(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('array');
      response.body.should.have.lengthOf(3);
    });

    it('should return nothing when user has no categories', async () => {
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

  describe('Retrieve Category - GET /api/v1/category/:id', () => {
    it('should return the category', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/${category1.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', category1.name);
      response.body.should.have.property('userId', adminUser.id);
    });

    it('should return empty if a category is not found', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/999999`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.empty;
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/${category1.id}`);

      response.status.should.be.eq(401);
    });
  });

  describe('Create Category - POST /api/v1/category/', () => {
    it('should create a category', async () => {
      const newCategory = {
        name: 'Test Category',
        userId: adminUser.id,
      };

      const response = await request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newCategory);

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', newCategory.name);
      response.body.should.have.property('userId', newCategory.userId);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .post(resourceUrl)
        .send(category2);

      response.status.should.be.eq(401);
    });
  });

  describe('Update Category - PUT /api/v1/category/:id', () => {
    it('should update a category', async () => {
      const updatedCategory = {
        name: 'Updated Category',
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

    it('should be able to update another user\'s category if is admin', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${category3.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: category2.name });

      response.status.should.be.eq(200);
      response.body.should.be.an('object');
      response.body.should.have.property('name', category2.name);

      category3.name = category2.name;
    });

    it('should not update another user\'s category if not admin', async () => {
      const token = createAccessToken(
        userToDelete.email,
        'user',
        userToDelete.firstName,
        userToDelete.lastName,
        userToDelete.id,
      );

      const response = await request(server)
        .put(`${resourceUrl}/${category3.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Stolen Update' });

      response.status.should.be.eq(200);
      response.body.should.be.empty;
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
      response.body.should.have.property('userId', adminUser.id);
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
      response.body.userId.should.not.equal(adminUser.id);
    });

    it('should not delete another user\'s category if not admin', async () => {
      const token = createAccessToken(
        otherUser.email,
        'user',
        otherUser.firstName,
        otherUser.lastName,
        otherUser.id,
      );

      const response = await request(server)
        .delete(`${resourceUrl}/${category1.id}`)
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(200);
      response.body.should.be.empty;
    });

    it('should delete a category and its subcategories', async () => {
      const parentCategory = { id: 0, name: 'Parent Category' };
      await createCategory(parentCategory, adminUser.id);

      const subCategory = { id: 0, name: 'Sub Category' };
      await createCategory(subCategory, adminUser.id, parentCategory.id);

      const response = await request(server)
        .delete(`${resourceUrl}/${parentCategory.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.have.property('name', parentCategory.name);

      const getSubCategoryResponse = await request(server)
        .get(`${resourceUrl}/${subCategory.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      getSubCategoryResponse.body.should.be.empty;
    });
  });
});
