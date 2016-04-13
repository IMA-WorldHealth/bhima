/* jshint expr:true */
/* global element, by, browser */

/**
 * Test helpers
 *
 * This module contains utilities that are useful in tests, but not specifically
 * tied to forms or modules.
 */

/** gets a random number within the range(0, n) */
exports.random = function random(n) {
  'use strict';
  return Math.floor((n) * Math.random() + 1);
};

exports.configure = function configure(chai) {
  'use strict';

  // enable promise chaining for chai assertions
  chai.use(require('chai-as-promised'));
};

exports.getCurrentPath = function getCurrentPath() {
  return browser.getCurrentUrl()
  .then(function (url) {
    var partial = url.split('#')[1];
    return '#'.concat(partial);
  });
};
