import { expect } from 'chai';
import { formatDate, formatCurrency } from './formatHelpers.jsx';

describe('FormatHelpers', function () {
  describe('formatDate', function () {
    before(function () {
      this.dateRegExp = /[0-2]\d\/[0-2]\d\/\d\d\d\d/;
    });

    it('should parse data correctly to `dd/mm/YYYY`', function () {
      const formattedDate = formatDate(new Date());

      formattedDate.should.not.be.empty;
      this.dateRegExp.test(formattedDate).should.be.true;
    });

    it('should throw error if trying to parse something that is not a date', function () {
      expect(() => formatDate()).to.throw(Error);
    });
  });

  describe('formatCurrency', function () {
    before(function () {
      this.currencyRegExp = /R\$ [0-9]+.\d\d/;
    });

    it('should parse data correctly to `R$ [0-9]+.DD`', function () {
      const formattedCurrency = formatCurrency(1);

      formattedCurrency.should.not.be.empty;
      this.currencyRegExp.test(formattedCurrency).should.be.true;
    });

    it('should throw error if trying to parse something that is not a number', function () {
      expect(() => formatCurrency()).to.throw(Error);
      expect(() => formatCurrency('123123')).to.throw(Error);
    });
  });
});
