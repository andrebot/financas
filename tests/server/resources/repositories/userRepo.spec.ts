import { errorHandler } from '../../../../src/server/resources/repositories/userRepo';

describe('User Repository', () => {
  it('should handle a duplicate user error', () => {
    const error = new Error('duplicateUser');

    (error as any).code = 11000;

    const result = errorHandler(error);

    result.should.be.instanceOf(Error);
    result.message.should.be.equal('duplicateUser');
  });

  it('should handle an unknown error', () => {
    const error = new Error('unknownError');

    const result = errorHandler(error);

    result.should.be.instanceOf(Error);
    result.message.should.be.equal('unknownError');
  });
});
