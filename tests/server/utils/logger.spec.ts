import { should } from 'chai';
import { formatMessageSafely } from '../../../src/server/utils/logger';

describe('logger Utilities', () => {
  describe('formatMessageSafely', () => {
    it('should return a string if the message is an error', () => {
      const message = new Error('test');
      const output = formatMessageSafely(message);
      output.should.be.a('string');
      output.should.contain('test');
    });

    it('should return a string if the message is an object', () => {
      const message = { test: 'test' };
      const output = formatMessageSafely(message);
      output.should.be.a('string');
      output.should.contain('test');
    });

    it('should return a string if the message is an array', () => {
      const message = [1, 2, 3];
      const output = formatMessageSafely(message);
      output.should.be.a('string');
      output.should.contain('1');
      output.should.contain('2');
      output.should.contain('3');
    });

    it('should return a string if the message is a number', () => {
      const message = 1;
      const output = formatMessageSafely(message);
      output.should.be.a('string');
      output.should.contain('1');
    });
    
    it('should return a string if the message is a boolean', () => {
      const message = true;
      const output = formatMessageSafely(message);
      output.should.be.a('string');
      output.should.contain('true');
    });
    
    it('should return a string if the message is a function', () => {
      const message = () => {
        return 'test';
      };
      const output = formatMessageSafely(message);
      output.should.be.a('string');
      output.should.contain('test');
    });
  });
});
