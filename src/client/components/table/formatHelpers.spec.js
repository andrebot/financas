import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { formatDate, formatCurrency, formatValue } from './formatHelpers.jsx';

describe('FormatHelpers', function () {
  before(function () {
    this.dateRegExp = /[0-2]\d\/[0-2]\d\/\d\d\d\d/;
    this.currencyRegExp = /R\$ [0-9]+.\d\d/;
  });

  describe('formatDate', function () {
    it('should parse data correctly to `dd/mm/YYYY`', function () {
      const formattedDate = formatDate(new Date());

      formattedDate.should.not.be.empty;
      this.dateRegExp.test(formattedDate).should.be.true;
    });

    it('should throw error if trying to parse something that is not a date', function () {
      expect(() => formatDate(123)).to.throw(Error);
    });

    it('should return empty string if the value is empty', function () {
      const emptyValue =  formatDate();

      emptyValue.should.be.a('string');
      emptyValue.should.be.empty;
    });
  });

  describe('formatCurrency', function () {
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

  describe('formatValue', function() {
    this.beforeEach(function () {
      this.transformStub = sinon.stub();
    });

    describe('format date', function () {
      beforeEach(function () {
        this.transformStub.returns(new Date);
      });

      it('should format the value as date', function () {
        const result = formatValue({value: 1, type: 'Date'}, this.transformStub);
  
        this.transformStub.should.have.been.calledOnce;
  
        result.should.not.be.empty;
        result.should.be.a('string');
        this.dateRegExp.test(result).should.be.true;
      });

      it('should return an empty string if there is no value', function () {
        this.transformStub.returns('');

        const result = formatValue({value: 1, type: 'Date'}, this.transformStub);
  
        this.transformStub.should.have.been.calledOnce;
  
        result.should.be.empty;
        result.should.be.a('string');
      });

      it('should throw an error if the value providade is not a date', function () {
        this.transformStub.returns(1);

        const result = () => {
          formatValue({value: 1, type: 'Date'}, this.transformStub);
        };

        result.should.throw('Trying to parse Date with some invalid value');
        this.transformStub.should.have.been.calledOnce;
      });
    });

    describe('format currency', function () {
      beforeEach(function () {
        this.transformStub.returns(123.2);
      });

      it('should format the value as currency', function () {
        const result = formatValue({value: 1, type: 'Currency'}, this.transformStub);

        this.transformStub.should.have.been.calledOnce;

        result.should.not.be.empty;
        result.should.be.a('string');
        this.currencyRegExp.test(result).should.be.true;
      });
    });

    describe('format boolean', function () {
      it('should return an Icon component if the value is true', function () {
        this.transformStub.returns(true);
        const result = formatValue({value: true, type: 'Boolean'}, this.transformStub);

        this.transformStub.should.have.been.calledOnce;

        const dom = mount(result);

        dom.find('i').length.should.gt(0);
        dom.props().name.should.eq('checkmark');
      });

      it('should return an Icon component if the value is true', function () {
        this.transformStub.returns(false);
        const result = formatValue({value: true, type: 'Boolean'}, this.transformStub);

        this.transformStub.should.have.been.calledOnce;

        const dom = mount(result);

        dom.find('i').length.should.gt(0);
        dom.props().name.should.eq('x');
      });
    });

    describe('format default', function () {
      it('should return the raw value if an empty type is provided', function () {
        const value = 1;
        this.transformStub.returns(value);

        const result = formatValue({value, type: ''}, this.transformStub);

        this.transformStub.should.have.been.calledOnce;
        result.should.be.eq(value);
      });

      it('should return the raw value if no type is provided', function () {
        const value = 1;
        this.transformStub.returns(value);

        const result = formatValue({value}, this.transformStub);

        this.transformStub.should.have.been.calledOnce;
        result.should.be.eq(value);
      });

      it('should return the raw value if an unknown type is provided', function () {
        const value = 1;
        this.transformStub.returns(value);

        const result = formatValue({value, type: 'dummy one'}, this.transformStub);

        this.transformStub.should.have.been.calledOnce;
        result.should.be.eq(value);
      });
    });
  });
});
