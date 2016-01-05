var expect = require('chai').expect,
    u      = require('../lib/util');

// tests for utility functions
describe('utilities', function () {
  'use strict';

  // tests components that are assertions (return true/false)
  describe('#assertions', function () {

    // testing primatives

    // integers
    it('should correctly distinguish integers with isInt', function () {

      expect(u.isInt({})).is.false;

      // NOTE by design, util coerces strings into integers.
      expect(u.isInt('2')).is.true;

      expect(u.isInt(2.00000001)).is.false;

      expect(u.isInt(Number(2))).is.true;

      expect(u.isInt(2)).is.true;
    });

    // numbers
    it('should correctly distinguish numbers with isNumber', function () {

      expect(u.isNumber({})).is.false;

      expect(u.isNumber(Number.NaN)).is.false;

      // NOTE by design, util coerces strings into numbers
      expect(u.isNumber('2')).is.true;

      expect(u.isNumber(2.00000001)).is.true;

      expect(u.isNumber(2)).is.true;
    });

    // arrays
    it('should correctly distinguish arrays with isArray', function () {

      expect(u.isArray([])).is.true;

      expect(u.isArray({})).is.false;

      expect(u.isArray('string')).is.false;

      expect(u.isArray(2)).is.false;
    });
    
    // strings
    it('should correctly distinguish strings with isString', function () {

      expect(u.isString({})).is.false;

      expect(u.isString(2)).is.false;

      expect(u.isString('2')).is.true;
    });
    
    // objects
    it('should correctly distinguish objects with isObject', function () {

      expect(u.isObject(2)).is.false;

      expect(u.isObject('2')).is.false;

      expect(u.isObject([])).is.true;

      expect(u.isObject({})).is.true;
    });

    // positive and negative numbers
    it('should correctly distinguish positive and negative numbers', function () {


      // positives
      expect(u.isPositive(-2)).is.false;

      expect(u.isPositive(2)).is.true;

      // negatives
      expect(u.isNegative(2)).is.false;

      expect(u.isNegative(-2)).is.true;
    });

    // defined
    it('should detect if an object is undefined', function () {

      var x;
      expect(u.isDefined(x)).is.false;

      expect(u.isDefined(undefined)).is.false;

      expect(u.isDefined(null)).is.true;

      expect(u.isDefined(2)).is.true;
    });
  });

  // tests components that are transformations of the input
  describe('#transforms', function () {

    it('should filter out duplicate values', function () {
      var unique = [1,2,3];

      // should be self-symmetric
      expect(u.toDistinctValues(unique)).to.deep.equal(unique);

      expect(u.toDistinctValues([1, 2, 3, 3])).to.deep.equal(unique);
    });

  });
});
