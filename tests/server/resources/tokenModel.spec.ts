import {
  addToken,
  isValidToken,
  deleteToken,
} from '../../../src/server/resources/tokenModel';

describe('Token Model', function () {
  it('should add a new token to the map', function() {
    const token = 'newToken';

    addToken(token);
    
    isValidToken(token).should.be.true;
    deleteToken(token);
  });

  it('should not add a token if the given string is empty', function() {
    addToken('');

    isValidToken('').should.be.false;
  });

  it('should be able to delete a token', function() {
    const token = 'newToken';

    addToken(token);

    isValidToken(token).should.be.true;

    deleteToken(token);

    isValidToken(token).should.be.false;
  })
});
