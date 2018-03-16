const validator = require('./validator');

describe('Helpers:Validator', function () {
  it('should correctly validate an email', function () {
    validator.isEmailValid('andre@gmail.com').should.be.true;
    validator.isEmailValid('andre@yahoo.com.br').should.be.true;
    validator.isEmailValid('andreyahoo.com.br').should.be.false;
    validator.isEmailValid('andre123_gogo@yahoo.com.br').should.be.true;
    validator.isEmailValid('!#$%ˆ&*()@yahoo.com.br').should.be.false;
    validator.isEmailValid('').should.be.false;
  });

  it('should correctly validate a name', function () {
    validator.isNameValid('Andre').should.be.true;
    validator.isNameValid('André').should.be.true;
    validator.isNameValid('@ndre').should.be.false;
    validator.isNameValid('Andre_Botelho').should.be.false;
    validator.isNameValid('Gonçalves').should.be.true;
    validator.isNameValid('').should.be.false;
    validator.isNameValid('!?').should.be.false;
    validator.isNameValid('caracteres especiais!@#$%()-_+').should.be.false;
  });

  it('sould correctly validate large texts', function() {
    validator.isLargeTextValid('').should.be.true;
    validator.isLargeTextValid('escrever qualquer coisa aqui para ver se isso aqui vai pegar!').should.be.true;
    validator.isLargeTextValid('caracteres especiais!@#$%()-_+').should.be.true;
  });

  it('should correctly validate credit card numbers', function() {
    validator.isCreditCardNumber('1234567891231234').should.be.true;
    validator.isCreditCardNumber('12a4567891231234').should.be.false;
    validator.isCreditCardNumber('1234567891231').should.be.false;
  });

  describe('Validating time repeating parameters', function () {
    it('should only accept year|month|week|day as values for frequency', function() {
      validator.isTimeRepeatingValue('year').should.be.true;
      validator.isTimeRepeatingValue('month').should.be.true;
      validator.isTimeRepeatingValue('week').should.be.true;
      validator.isTimeRepeatingValue('day').should.be.true;
      validator.isTimeRepeatingValue('hours').should.be.false;
      validator.isTimeRepeatingValue('blah').should.be.false;
    });

    it('should only accepts monday|tuesday|wednesday|thursday|friday as week days', function() {
      validator.isWeekDay('monday').should.be.true;
      validator.isWeekDay('tuesday').should.be.true;
      validator.isWeekDay('wednesday').should.be.true;
      validator.isWeekDay('thursday').should.be.true;
      validator.isWeekDay('friday').should.be.true;
      validator.isWeekDay('sunday').should.be.false;
      validator.isWeekDay('saturday').should.be.false;
    });

    it('should be case sensitive for both week days and frequency values', function() {
      validator.isWeekDay('Thursday').should.be.false;
      validator.isWeekDay('ThuRsdAY').should.be.false;
      validator.isTimeRepeatingValue('Week').should.be.false;
      validator.isTimeRepeatingValue('wEEk').should.be.false;
    });
  });
});
