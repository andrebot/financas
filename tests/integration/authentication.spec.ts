import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../src/server/server';
import { adminUser } from './connectDB';

chai.use(chaiHttp);

describe('Authentication', () => {
  describe('POST /api/v1/user', () => {
    it('should return a 401 error if the user is not authenticated', (done) => {
      chai.request(server)
        .get('/api/v1/user')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should list users successfully if the user is authenticated', (done) => {

    });
  });
});
