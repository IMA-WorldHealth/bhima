// test for server/lib/guid.js

var expect = require('chai').expect,
    guid   = require('../lib/guid');

describe('guid', function () {
  'use strict';

  describe('#guid()', function () {
    it('creates uuid of type 4', function () {
      var g1 = guid(),
          g2 = guid();
  
      // assert that this is a version 4 uuid
      expect(g1[14]).to.eql('4');
      expect(g1).to.not.eql(g2);
      expect(g1.length).to.eql(36);

    });
  });
});
