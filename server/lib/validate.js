// scripts/lib/util/validate.js

// This module provides additional validation utilities for tests
// throughout the server.

module.exports = function () {
  'use strict';

  return {
    isValidNumber : function (number) {
      var cast = Number(number);
      return Number.isFinite(cast) && !Number.isNaN(cast);
    },
    isPositive : function (number) {
      return this.isValidNumber(number) && Number(number) >= 0;
    },
    isNegative : function (number) { return !this.isPositive(number); },
    isEqual : function (a, b) { return a === b; },
  };

};
