import { should } from 'chai';
import User from '../../../src/server/resources/userModel';

describe('User Model', () => {
  it('should hide the password when converting to JSON', function() {
    const user = new User({ email: 'test@example.com', firstName: 'John', lastName: 'Doe', password: '123456', role: 'user' });
    const userObj = user.toJSON();

    userObj.should.not.have.property('password');
  });

  it('should hide the password when converting to Object', function() {
    const user = new User({ email: 'test@example.com', firstName: 'John', lastName: 'Doe', password: '123456', role: 'user' });
    const userObj = user.toObject();

    userObj.should.not.have.property('password');
  });

  it('should validate email format', function() {
    const user = new User({ email: 'invalidEmail', firstName: 'John', lastName: 'Doe', password: '123456', role: 'user' });
    const validationResult = user.validateSync();

    should().exist(validationResult);
    validationResult?.errors.email.value.should.include('invalidEmail');
  });

  it('should not accept values that are not \'admin\' or \'user\'', function() {
    const user = new User({ email: 'test@example.com', firstName: 'John', lastName: 'Doe', password: '123456', role: 'invalid' });
    const validationResult = user.validateSync();

    should().exist(validationResult);
    validationResult?.errors.role.value.should.include('invalid');
  });
});
