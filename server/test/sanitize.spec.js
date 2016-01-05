// tests for server/lib/util/sanitize.js

// FIXME
// sanitize.js is deprecated and should be replaced with db.exec() escapes,
// which are much safer.  See the db.js file for documentation on how to use
// db.exec() to sanitize SQL inputs correctly.
// However, since sanitize.js is still used in production code, these tests
// should continue to be run until the sanitze.js file is extracted.

var expect = require('chai').expect,
    s = require('../lib/sanitize');

describe('sanitize', function () {

  describe('#isArray()', function () {
    it('should recognize constructed arrays of various types', function () {
      expect(s.isArray([1,2,'s'])).to.be.true;
      expect(s.isArray({id: 1})).to.be.false;
      expect(s.isArray('[1,2]')).to.be.false;
      expect(s.isArray(1)).to.be.false;
    });
  });

  describe('#escape()', function () {
    it('should escape strings and integers correctly', function () {
      expect(s.escape('id')).to.eql('"id"');
      expect(s.escape(1)).to.eql('"1"');
      expect(s.escape('12.4')).to.eql('"12.4"');
    });
  });

  describe('#escapeid()', function () {
    it('should escape ids with SQL tick marks', function () {
      expect(s.escapeid('id')).to.eql('`id`');
    });
  });

  describe('#isInt()', function () {
    it('should recognize and convert integers', function () {
      expect(s.isInt(0)).to.be.true;
      expect(s.isInt(3)).to.be.true;
      expect(s.isInt('3')).to.be.true;
    });
  });

  describe('#isObject()', function () {
    it('should recognize objects', function () {
      expect(s.isObject({})).to.be.true;
      expect(s.isObject('string')).to.be.false;
    });
  });

  describe('#isFloat()', function () {
    it('should recognize floats', function () {
      expect(s.isFloat(3.5)).to.be.true;
      expect(s.isFloat('3.5')).to.be.true;
      expect(s.isFloat('5')).to.be.false;
    });
  });

  describe('#isString()', function () {
    it('should recognize strings', function () {
      expect(s.isString('string')).to.be.true;
      expect(s.isString(3)).to.be.false;
    });
  });
});
