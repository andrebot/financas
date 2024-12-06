import { should } from 'chai';
import {
  removeEmptyProperties,
  isObjectEmptyOrNull,
  checkVoidPayload,
  checkVoidInstance,
  checkVoidUser,
  calculateLastMonth,
} from '../../../src/server/utils/misc';

describe('misc Utilities', () => {
  describe('removeEmptyProperties', () => {
    it('should remove null and undefined properties', () => {
      const input = { a: null, b: undefined, c: 1 };
      const output = removeEmptyProperties(input);
      output.should.deep.equal({ c: 1 });
    });
  
    it('should remove empty objects', () => {
      const input = { a: {}, b: { c: {} }, d: 1 };
      const output = removeEmptyProperties(input);
      output.should.deep.equal({ d: 1 });
    });
  
    it('should remove empty arrays', () => {
      const input = { a: [], b: [null, {}, []], c: 1 };
      const output = removeEmptyProperties(input);
      output.should.deep.equal({ c: 1 });
    });
  
    it('should preserve RegExp objects', () => {
      const input = { a: /test/i, b: { c: /abc/ }, d: null };
      const output = removeEmptyProperties(input);
      output.should.deep.equal({ a: /test/i, b: { c: /abc/ } });
    });
  
    it('should work with deeply nested objects', () => {
      const input = {
        a: null,
        b: { c: {}, d: { e: { f: null }, g: 1 } },
        h: [],
        i: { j: { k: { l: {} } }, m: /xyz/ },
      };
      const output = removeEmptyProperties(input);
      output.should.deep.equal({
        b: { d: { g: 1 } },
        i: { m: /xyz/ },
      });
    });
  
    it('should preserve non-empty arrays and objects', () => {
      const input = {
        a: [1, 2, 3],
        b: { c: 'test', d: /abc/ },
        e: null,
      };
      const output = removeEmptyProperties(input);
      output.should.deep.equal({
        a: [1, 2, 3],
        b: { c: 'test', d: /abc/ },
      });
    });
  
    it('should return undefined for null or undefined input', () => {
      let result = removeEmptyProperties(null);
      should().not.exist(result);
  
      result = removeEmptyProperties(undefined);
      should().not.exist(result);
    });
  
    it('should return empty array for arrays with only null/empty values', () => {
      const input = [null, {}, []];
      const output = removeEmptyProperties(input);
      should().not.exist(output);
    });
  
    it('should handle primitives as input', () => {
      removeEmptyProperties(42).should.equal(42);
      removeEmptyProperties('test').should.equal('test');
      removeEmptyProperties(true).should.equal(true);
    });
  
    it('should handle arrays with mixed content', () => {
      const input = [null, 1, {}, [], 'test', /abc/];
      const output = removeEmptyProperties(input);
      output.should.deep.equal([1, 'test', /abc/]);
    });
  });

  describe('isObjectEmptyOrNull', () => {
    it('should return true for null or undefined', () => {
      isObjectEmptyOrNull(null).should.be.true;
      isObjectEmptyOrNull(undefined).should.be.true;
    });
  
    it('should return true for an empty object', () => {
      isObjectEmptyOrNull({}).should.be.true;
    });
  
    it('should return true for an object with all null or undefined values', () => {
      isObjectEmptyOrNull({ a: null, b: undefined }).should.be.true;
    });
  
    it('should return false for an object with at least one non-empty property', () => {
      isObjectEmptyOrNull({ a: null, b: 'test' }).should.be.false;
    });
  
    it('should return true for an empty array', () => {
      isObjectEmptyOrNull([]).should.be.true;
    });
  
    it('should return false for an array with non-empty elements', () => {
      isObjectEmptyOrNull([null, {}, [], 'test']).should.be.false;
    });
  
    it('should return true for an array with all empty elements', () => {
      isObjectEmptyOrNull([null, {}, []]).should.be.true;
    });
  
    it('should return false for objects with non-empty nested structures', () => {
      isObjectEmptyOrNull({ a: { b: 1 } }).should.be.false;
    });
  
    it('should return true for objects with only empty nested structures', () => {
      isObjectEmptyOrNull({ a: { b: {} }, c: null }).should.be.true;
    });
  
    it('should handle primitive values correctly', () => {
      isObjectEmptyOrNull(42).should.be.false;
      isObjectEmptyOrNull('test').should.be.false;
      isObjectEmptyOrNull(true).should.be.false;
      isObjectEmptyOrNull(false).should.be.false;
    });
  
    it('should return true for deeply nested empty structures', () => {
      isObjectEmptyOrNull({
        a: {
          b: {
            c: [],
            d: {},
          },
        },
      }).should.be.true;
    });
  
    it('should return false for deeply nested non-empty structures', () => {
      isObjectEmptyOrNull({
        a: {
          b: {
            c: [],
            d: { e: 1 },
          },
        },
      }).should.be.false;
    });
  
    it('should correctly handle arrays with nested objects', () => {
      isObjectEmptyOrNull([{ a: {} }, { b: null }]).should.be.true;
      isObjectEmptyOrNull([{ a: 1 }, { b: null }]).should.be.false;
    });
  
    it('should return false for a `RegExp` object', () => {
      isObjectEmptyOrNull(/test/i).should.be.false;
    });
  });

  describe('checkVoidPayload', () => {
    it('should throw an error if the payload is empty', () => {
      try {
        checkVoidPayload({}, 'test', 'test');
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('No information provided to test test');
      }
    });

    it('should throw an error if the payload is undefined', () => {
      try {
        checkVoidPayload(undefined, 'test', 'test');
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('No information provided to test test');
      }
    });

    it('should throw an error if the payload is null', () => {
      try {
        checkVoidPayload(null, 'test', 'test');
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('No information provided to test test');
      }
    });

    it('should not throw an error if the payload is not empty', () => {
      try {
        checkVoidPayload({ a: 1 }, 'test', 'test');
      } catch (error) {
        should().fail();
      }
    });
  });

  describe('checkVoidInstance', () => {
    it('should throw an error if the instance is undefined', () => {
      try {
        checkVoidInstance(undefined, 'test', 'test');
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('test not found with id test');
      }
    });

    it('should throw an error if the instance is null', () => {
      try {
        checkVoidInstance(null, 'test', 'test');
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('test not found with id test');
      }
    });

    it('should throw an error if the instance is empty', () => {
      try {
        checkVoidInstance({}, 'test', 'test');
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('test not found with id test');
      }
    });

    it('should not throw an error if the instance is not empty', () => {
      try {
        checkVoidInstance({ a: 1 }, 'test', 'test');
      } catch (error) {
        should().fail();
      }
    });
  });

  describe('checkVoidUser', () => {
    it('should throw an error if the user is undefined', () => {
      try {
        checkVoidUser(undefined, 'test', 'test');
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('User not authenticated to test test');
      }
    });

    it('should throw an error if the user is empty', () => {
      try {
        checkVoidUser({}, 'test', 'test');
      } catch (error) {
        (error as Error).should.be.an('error');
        (error as Error).message.should.contain('User not authenticated to test test');
      }
    });

    it('should not throw an error if the user is not empty', () => {
      try {
        checkVoidUser({ id: '1' }, 'test', 'test');
      } catch (error) {
        should().fail();
      }
    });
  });

  describe('calculateLastMonth', () => {
    it('should return the previous year and december if the month is january', () => {
      const { year, month } = calculateLastMonth(2020, 1);
      year.should.be.equal(2019);
      month.should.be.equal(12);
    });

    it('should return the same year and previous month if the month is not january', () => {
      const { year, month } = calculateLastMonth(2020, 2);
      year.should.be.equal(2020);
      month.should.be.equal(1);
    });
  });
});

