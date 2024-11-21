import chai from 'chai';
import sinon from 'sinon';
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
      adminUser._id,
    );
  });

  describe('List Categories - GET /api/v1/category', () => {
    it('should return the list of categories', (done) => {
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

    it('should return nothing when user has no categories', (done) => {
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
      const stub = sinon.stub(categoryModel, 'find').throws(new Error('Error'));

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

  describe('Retrieve Category - GET /api/v1/category/:id', () => {
    it('should return the category', (done) => {
      chai.request(server)
        .get(`${resourceUrl}/${category1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', category1.name);
          response.body.should.have.property('user', adminUser._id.toString());

          done();
        });
    });

    it('should return empty if an category is not found', (done) => {
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
        .get(`${resourceUrl}/${category1._id}`)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(categoryModel, 'findById').throws(new Error('Error'));

      chai.request(server)
        .get(`${resourceUrl}/${category1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });

  describe('Create Category - POST /api/v1/category/', () => {
    it('should create a category', (done) => {
      const newCategory = {
        name: 'Test Account',
        user: adminUser._id,
      };

      chai.request(server)
        .post(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newCategory)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', newCategory.name);
          response.body.should.have.property('user', newCategory.user.toString());

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .post(`${resourceUrl}`)
        .send(category2)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(categoryModel.prototype, 'save').throws(new Error('Error'));

      chai.request(server)
        .post(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(category2)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });

  describe('Update Category - PUT /api/v1/category/:id', () => {
    it('should update a category', (done) => {
      const updatedCategory = {
        name: 'Updated Account',
      };

      chai.request(server)
        .put(`${resourceUrl}/${category1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedCategory)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', updatedCategory.name);

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${category1._id}`)
        .send(category2)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should throw 500 when no information is provided', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${category1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          done();
        });
    });

    it('should throw 500 when provided an empty object to update', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${category1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .end((err, response) => {
          response.should.have.status(500);
          done();
        });
    });

    it('should be able to update another user\'s category if is admin', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${category3._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(category2)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', category2.name);

          done();
        });
    });

    it('should return 403 when the user is not allowed to update the category', (done) => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      chai.request(server)
        .put(`${resourceUrl}/${category3._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(category2)
        .end((err, response) => {
          response.should.have.status(403);
          done();
        });
    });

    it('should return 500 if no category is found', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(category2)
        .end((err, response) => {
          response.should.have.status(500);
          done();
        });
    });
  });

  describe('Delete Category - DELETE /api/v1/category/:id', () => {
    it('should delete a category', (done) => {
      chai.request(server)
        .delete(`${resourceUrl}/${category2._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', category2.name);
          response.body.should.have.property('user', adminUser._id.toString());

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .delete(`${resourceUrl}/${category1._id}`)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should be able to delete another user\'s category if is admin', (done) => {
      chai.request(server)
        .delete(`${resourceUrl}/${category3._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', category3.name);
          response.body.should.have.property('user');
          response.body.user.should.not.equal(adminUser._id.toString());

          done();
        });
    });

    it('should return 403 when the user is not allowed to delete the category', (done) => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      chai.request(server)
        .delete(`${resourceUrl}/${category1._id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, response) => {
          response.should.have.status(403);
          done();
        });
    });

    it('should return 500 if no category is found', (done) => {
      chai.request(server)
        .delete(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(categoryModel, 'findByIdAndDelete').throws(new Error('Error'));

      chai.request(server)
        .delete(`${resourceUrl}/${category1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });
});
