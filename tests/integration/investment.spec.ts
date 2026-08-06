import request from 'supertest';
import server from '../../src/server/server';
import {
  investment1,
  investment2,
  investment3,
  account1,
  adminUser,
  otherUser,
  userToDelete,
} from './connectDB';
import { createAccessToken } from '../../src/server/managers/authenticationManager';

const resourceUrl = '/api/v1/investment';

describe('Investment', () => {
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

  describe('List Investments - GET /api/v1/investment', () => {
    it('should return a paginated envelope with all investments when user is admin', async () => {
      const response = await request(server)
        .get(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.have.property('data').that.is.an('array').with.lengthOf(3);
      response.body.should.have.property('page', 1);
      response.body.should.have.property('pageSize', 20);
      response.body.should.have.property('total', 3);
      response.body.should.have.property('totalPages', 1);
    });

    it('should filter by investmentType', async () => {
      const response = await request(server)
        .get(`${resourceUrl}?investmentType=cdb`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.data.should.have.lengthOf(1);
      response.body.data[0].should.have.property('id', investment1.id);
    });

    it('should filter by archived', async () => {
      const response = await request(server)
        .get(`${resourceUrl}?archived=true`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.data.should.have.lengthOf(1);
      response.body.data[0].should.have.property('id', investment2.id);
    });

    it('should paginate results', async () => {
      const response = await request(server)
        .get(`${resourceUrl}?page=1&pageSize=1`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.data.should.have.lengthOf(1);
      response.body.should.have.property('pageSize', 1);
      response.body.should.have.property('total', 3);
      response.body.should.have.property('totalPages', 3);
    });

    it('should scope results to the authenticated user when not admin', async () => {
      const token = createAccessToken(
        otherUser.email,
        'user',
        otherUser.firstName,
        otherUser.lastName,
        otherUser.id,
      );

      const response = await request(server)
        .get(resourceUrl)
        .set('Authorization', `Bearer ${token}`);

      response.status.should.be.eq(200);
      response.body.data.should.have.lengthOf(1);
      response.body.data[0].should.have.property('id', investment3.id);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server).get(resourceUrl);

      response.status.should.be.eq(401);
    });
  });

  describe('Retrieve Investment - GET /api/v1/investment/:id', () => {
    it('should return the investment', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/${investment1.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.have.property('name', investment1.name);
      response.body.should.have.property('investmentType', investment1.investmentType);
    });

    it('should return empty if an investment is not found', async () => {
      const response = await request(server)
        .get(`${resourceUrl}/999999`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.be.empty;
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server).get(`${resourceUrl}/${investment1.id}`);

      response.status.should.be.eq(401);
    });
  });

  describe('Create Investment - POST /api/v1/investment', () => {
    it('should create an investment', async () => {
      const newInvestment = {
        name: 'New CDB', investmentType: 'cdb', accountId: account1.id, userId: adminUser.id,
      };

      const response = await request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newInvestment);

      response.status.should.be.eq(200);
      response.body.should.have.property('name', newInvestment.name);
      response.body.should.have.property('investmentType', newInvestment.investmentType);
      response.body.should.have.property('archived', false);
      response.body.should.have.property('totalInvested', '0.00');
    });

    it('should return 500 if investmentType has a wrong value', async () => {
      const response = await request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Bad Investment', investmentType: 'wrong', accountId: account1.id, userId: adminUser.id,
        });

      response.status.should.be.eq(500);
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server).post(resourceUrl).send(investment1);

      response.status.should.be.eq(401);
    });
  });

  describe('Update Investment - PUT /api/v1/investment/:id', () => {
    it('should update an investment', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${investment1.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Investment Name' });

      response.status.should.be.eq(200);
      response.body.should.have.property('name', 'Updated Investment Name');

      investment1.name = 'Updated Investment Name';
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${investment1.id}`)
        .send({ name: 'Stolen Update' });

      response.status.should.be.eq(401);
    });

    it('should be able to update another user\'s investment if is admin', async () => {
      const response = await request(server)
        .put(`${resourceUrl}/${investment3.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Admin Updated Investment' });

      response.status.should.be.eq(200);
      response.body.should.have.property('name', 'Admin Updated Investment');

      investment3.name = 'Admin Updated Investment';
    });

    it('should not update another user\'s investment if not admin', async () => {
      const token = createAccessToken(
        userToDelete.email,
        'user',
        userToDelete.firstName,
        userToDelete.lastName,
        userToDelete.id,
      );

      const response = await request(server)
        .put(`${resourceUrl}/${investment1.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Stolen Update' });

      response.status.should.be.eq(200);
      response.body.should.be.empty;
    });
  });

  describe('Delete Investment - DELETE /api/v1/investment/:id', () => {
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
          name: 'Delete Me Own', investmentType: 'cdb', accountId: account1.id, userId: adminUser.id,
        });
      ownDeleteId = ownRes.body.id;

      const otherRes = await request(server)
        .post(resourceUrl)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          name: 'Delete Me Other', investmentType: 'stock', accountId: account1.id, userId: otherUser.id,
        });
      otherDeleteId = otherRes.body.id;
    });

    it('should delete an investment', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${ownDeleteId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.have.property('name', 'Delete Me Own');
    });

    it('should return 401 when the user is not authenticated', async () => {
      const response = await request(server).delete(`${resourceUrl}/${investment1.id}`);

      response.status.should.be.eq(401);
    });

    it('should be able to delete another user\'s investment if is admin', async () => {
      const response = await request(server)
        .delete(`${resourceUrl}/${otherDeleteId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      response.status.should.be.eq(200);
      response.body.should.have.property('name', 'Delete Me Other');
    });
  });
});
