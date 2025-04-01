import sinon from 'sinon';
import { should } from 'chai';
import { errorHandler, UserRepo } from '../../../../src/server/resources/repositories/userRepo';

describe('User Repository', () => {
  let userRepo: UserRepo;
  let userModel = {
    findOne: sinon.stub(),
  };

  beforeEach(function() {
    userModel.findOne.reset();
    userRepo = new UserRepo(userModel as any);
  });

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

  it('should find a user by email', async function() {
    const email = 'test@test.com';
    const user = { id: '1', email };

    userModel.findOne.resolves({
      toObject: sinon.stub().resolves(user),
    });

    const result = await userRepo.findByEmail(email);

    should().exist(result);
    result!.id!.should.be.equal('1');
    result!.email.should.be.equal('test@test.com');
  });
});
