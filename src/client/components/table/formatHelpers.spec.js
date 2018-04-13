import sinon from 'sinon';
import { expect } from 'chai';
import { formatDate, formatCurrency } from './formatHelpers.jsx';

describe('FormatHelpers', function () {
  describe('formatDate', function () {
    before(function () {
      this.dateRegExp = /[0-2]\d\/[0-2]\d\/\d\d\d\d/;
    });

    it('should parse data correctly to dd/mm/YYYY', function () {
      const formattedDate = formatDate(new Date());

      formattedDate.should.not.be.empty;
      this.dateRegExp.test(formattedDate).should.be.true;
    });

    it('should throw error if trying to parse something that is not a date', function () {
      expect(() => formatDate()).to.throw(Error);
    });
  });
});
