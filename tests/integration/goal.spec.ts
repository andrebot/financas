import chai from 'chai';
import sinon from 'sinon';
import { Types } from 'mongoose';
import server from '../../src/server/server';
import { goal1, goal2, goal3, adminUser } from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager';
import goalModel from '../../src/server/resources/goalModel';

const resourceUrl = '/api/v1/goal';

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

  describe('List Goals - GET /api/v1/goal', () => {
    it('should return the list of goals', (done) => {
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

    it('should return nothing when user has no goals', (done) => {
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
      const stub = sinon.stub(goalModel, 'find').throws(new Error('Error'));

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

  describe('Retrieve Goal - GET /api/v1/goal/:id', () => {
    it('should return the goal', (done) => {
      chai.request(server)
        .get(`${resourceUrl}/${goal1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', goal1.name);
          response.body.should.have.property('value', goal1.value);
          response.body.should.have.property('dueDate', goal1.dueDate.toISOString());
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
        .get(`${resourceUrl}/${goal1._id}`)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(goalModel, 'findById').throws(new Error('Error'));

      chai.request(server)
        .get(`${resourceUrl}/${goal1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });

  describe('Create Goal - POST /api/v1/goal/', () => {
    it('should create a goal', (done) => {
      const newGoal = {
        name: 'Test Account',
        value: 400,
        dueDate: new Date(),
        user: adminUser._id,
      };

      chai.request(server)
        .post(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newGoal)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', newGoal.name);
          response.body.should.have.property('user', newGoal.user.toString());

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .post(`${resourceUrl}`)
        .send(goal2)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(goalModel.prototype, 'save').throws(new Error('Error'));

      chai.request(server)
        .post(`${resourceUrl}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(goal2)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });

  describe('Update Goal - PUT /api/v1/goal/:id', () => {
    it('should update a goal', (done) => {
      const updatedGoal = {
        name: 'Updated Goal',
      };

      chai.request(server)
        .put(`${resourceUrl}/${goal1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedGoal)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', updatedGoal.name);

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${goal1._id}`)
        .send(goal2)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should throw 500 when no information is provided', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${goal1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          done();
        });
    });

    it('should throw 500 when provided an empty object to update', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${goal1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .end((err, response) => {
          response.should.have.status(500);
          done();
        });
    });

    it('should be able to update another user\'s goal if is admin', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${goal3._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(goal2)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', goal2.name);

          done();
        });
    });

    it('should return 403 when the user is not allowed to update the goal', (done) => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      chai.request(server)
        .put(`${resourceUrl}/${goal3._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(goal2)
        .end((err, response) => {
          response.should.have.status(403);
          done();
        });
    });

    it('should return 500 if no goal is found', (done) => {
      chai.request(server)
        .put(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(goal2)
        .end((err, response) => {
          response.should.have.status(500);
          done();
        });
    });
  });

  describe('Delete Goal - DELETE /api/v1/goal/:id', () => {
    it('should delete a goal', (done) => {
      chai.request(server)
        .delete(`${resourceUrl}/${goal2._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', goal2.name);
          response.body.should.have.property('user', adminUser._id.toString());

          done();
        });
    });

    it('should return 401 when the user is not authenticated', (done) => {
      chai.request(server)
        .delete(`${resourceUrl}/${goal1._id}`)
        .end((err, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it('should be able to delete another user\'s goal if is admin', (done) => {
      chai.request(server)
        .delete(`${resourceUrl}/${goal3._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.should.have.property('name', goal3.name);
          response.body.should.have.property('user');
          response.body.user.should.not.equal(adminUser._id.toString());

          done();
        });
    });

    it('should return 403 when the user is not allowed to delete the goal', (done) => {
      const token = createAccessToken(
        'test@gmail.com',
        'user',
        'Test',
        'User',
        new Types.ObjectId().toString(),
      );

      chai.request(server)
        .delete(`${resourceUrl}/${goal1._id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, response) => {
          response.should.have.status(403);
          done();
        });
    });

    it('should return 500 if no goal is found', (done) => {
      chai.request(server)
        .delete(`${resourceUrl}/${new Types.ObjectId()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          done();
        });
    });

    it('should return 500 when an error occurs', (done) => {
      const stub = sinon.stub(goalModel, 'findByIdAndDelete').throws(new Error('Error'));

      chai.request(server)
        .delete(`${resourceUrl}/${goal1._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, response) => {
          response.should.have.status(500);
          stub.restore();
          done();
        });
    });
  });
});
