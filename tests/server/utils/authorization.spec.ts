import { Response, NextFunction } from 'express';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { RequestWithUser } from '../../../src/server/types';

const jwtVerifyStub = sinon.stub();

const { default: createAccessTokenValidation } = proxyquire('../../../src/server/utils/authorization', {
  'jsonwebtoken': { verify: jwtVerifyStub, '@global': true },
});

type MiddlewareType = (req: RequestWithUser, res: Response, next: NextFunction) => void

describe('authorization helper', () => {
  it('should create a authorization middlware function', () => {
    const result = createAccessTokenValidation(true);
    
    result.should.be.a('function');
  });

  describe('authorization middleware function', () => {
    let middleware: MiddlewareType;
    let req: RequestWithUser;
    let res: Response;
    let next = sinon.spy();
    let userPayload = {
      email: 'test@gmail.com' ,
      role: 'admin',
      firstName: 'test',
      lastName: 'user',
    };

    beforeEach(() => {
      middleware = createAccessTokenValidation(true);
      req = {
        headers: { authorization: 'Bearer eyJhJ9.eyTE2MjM5MDIyfQ.SflK_5c', },
      } as RequestWithUser;
      res = {
        sendStatus: sinon.spy(),
      } as unknown as Response;
      next.resetHistory();
      jwtVerifyStub.resetHistory();
      jwtVerifyStub.returns(userPayload);
    });

    it('should return 401 if no token is provided', () => {
      req.headers = {};
      middleware(req, res, next);
      res.sendStatus.should.have.been.calledOnceWith(401);
      next.should.not.have.been.called;
    });

    it('should return 401 if token is not in the correct format', () => {
      req.headers.authorization = 'Bearer wrong';
      middleware(req, res, next);
      res.sendStatus.should.have.been.calledOnceWith(401);
      next.should.not.have.been.called;
      jwtVerifyStub.should.not.have.been.called;
    });

    it('should return 403 if token is not valid', () => {
      jwtVerifyStub.throws('error');

      middleware(req, res, next);

      jwtVerifyStub.should.have.been.called;
      res.sendStatus.should.have.been.calledOnceWith(403);
    });

    it('should return 403 if token payload is not an object', () => {
      jwtVerifyStub.returns(null);

      middleware(req, res, next);

      jwtVerifyStub.should.have.been.called;
      res.sendStatus.should.have.been.calledOnceWith(403);
    });

    it('should return 403 if user is not an admin', () => {
      userPayload.role = 'user';
      jwtVerifyStub.returns(userPayload);

      middleware(req, res, next);

      jwtVerifyStub.should.have.been.called;
      res.sendStatus.should.have.been.calledOnceWith(403);
    });

    it('should set user payload and call next if user is an admin', () => {
      userPayload.role = 'admin';

      middleware(req, res, next);

      jwtVerifyStub.should.have.been.called;
      res.sendStatus.should.not.have.been.called;
      next.should.have.been.calledOnce;
      req.user?.should.deep.equal(userPayload);
    });

    it('should set user payload and call next if user is not an admin', () => {
      middleware = createAccessTokenValidation();

      middleware(req, res, next);

      jwtVerifyStub.should.have.been.called;
      res.sendStatus.should.not.have.been.called;
      next.should.have.been.calledOnce;
      req.user?.should.deep.equal(userPayload);
    });
  });
});
