import sinon from 'sinon';
import { Response } from 'express';
import { handleError, isValidObjectId } from '../../../src/server/utils/responseHandlers';

describe('responseHandlers', () => {
  describe('handleError', () => {
    it('should return a response with the error message and status', () => {
      const error = new Error('test');
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      } as unknown as Response;
      const status = 500;

      handleError(error, res, status);

      res.status.should.have.been.calledWith(status);
      res.send.should.have.been.calledWith({ error: error.message });
    });

    it('should default to status 500 if no status is provided', () => {
      const error = new Error('test');
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      } as unknown as Response;

      handleError(error, res);

      res.status.should.have.been.calledWith(500);
      res.send.should.have.been.calledWith({ error: error.message });
    });

    it('should call response with error status 404 if the error is a not found error', () => {
      const error = new Error('not found');
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      } as unknown as Response;

      handleError(error, res);

      res.status.should.have.been.calledWith(404);
      res.send.should.have.been.calledWith({ error: error.message });
    });

    it('should call response with error status 403 if the error is a is not allowed error', () => {
      const error = new Error('is not allowed');
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.spy(),
      } as unknown as Response;

      handleError(error, res);

      res.status.should.have.been.calledWith(403);
      res.send.should.have.been.calledWith({ error: error.message });
    });
  });

  describe('isValidObjectId', () => {
    it('should return true if the string is a valid ObjectId', () => {
      const result = isValidObjectId('5f0c0d9b0b4e3f001f2e8b2e');

      result.should.be.true;
    });

    it('should return false if the string is not a valid ObjectId', () => {
      const result = isValidObjectId('test');

      result.should.be.false;
    });
  });
});
