// scripts/lib/util/validate.js

// This module provides additional validation utilities for tests
// throughout the server.

module.exports = function () {
  'use strict';

  return {
    isValidDate : function (date) { return !Number.isNaN(date.parse(date)); },
    isValidNumber : function (number) {
      var cast = Number(number);
      return Number.isFinite(cast) && !Number.isNaN(cast);
    },
    isPositive : function (number) {
      return this.isValidNumber(number) && Number(number) >= 0;
    },
    isNegative : function (number) { return !this.isPositive(number); },
    isEqual : function (a, b) { return a === b; },
    isDefined : function (a) { return a !== undefined; },
    isUndefined : function (a) { return !this.isDefined(a); },
    isNull : function (a) { return a === null; },
    exists : function (a) { return this.isDefined(a) && !this.isNull(a); }
  };

};
