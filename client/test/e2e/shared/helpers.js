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

// shared data
exports.data = {

  // location IDs for the location select component
  locations : [
   'dbe330b6-5cde-4830-8c30-dc00eccd1a5f', // Democratic Republic of the Congo
   'f6fc7469-7e58-45cb-b87c-f08af93edade', // Bas Congo,
   '0404e9ea-ebd6-4f20-b1f8-6dc9f9313450', // Tshikapa,
   '1f162a10-9f67-4788-9eff-c1fea42fcc9b'  // kele
  ]
};
