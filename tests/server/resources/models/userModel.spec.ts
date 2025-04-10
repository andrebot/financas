import { should } from 'chai';
import UserModel from '../../../../src/server/resources/models/userModel';

describe('User Model', () => {
  it('should validate email format', function() {
    const user = new UserModel({ email: 'invalidEmail', firstName: 'John', lastName: 'Doe', password: '123456', role: 'user' });
    const validationResult = user.validateSync();

    should().exist(validationResult);
    validationResult?.errors.email.value.should.include('invalidEmail');
  });

  it('should not accept values that are not \'admin\' or \'user\'', function() {
    const user = new UserModel({ email: 'test@example.com', firstName: 'John', lastName: 'Doe', password: '123456', role: 'invalid' });
    const validationResult = user.validateSync();

    should().exist(validationResult);
    validationResult?.errors.role.value.should.include('invalid');
  });

  it('should convert _id to id when converting to JSON', function() {
    const user = new UserModel({ email: 'test@example.com', firstName: 'John', lastName: 'Doe', password: '123456', role: 'user' });
    const json = user.toJSON();

    should().exist(json);
    json.id.should.equal(user._id.toString());
  });
});
