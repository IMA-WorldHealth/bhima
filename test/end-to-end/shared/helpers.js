/* global browser */

/**
 * @overview helpers
 *
 * @description
 * This file contains utilities that are useful in tests, but not specifically
 * tied to forms or modules.
 */

// eslint-disable-next-line
const chaiPromise = require('chai-as-promised');
// eslint-disable-next-line
const addContext = require('mochawesome/addContext');
const fs = require('mz/fs');
const path = require('path');

const PATH_REGEXP = /^#!|^#|^!/g;

// gets a random number within the range(0, n)
exports.random = function random(n) {
  return Math.floor(((n) * Math.random()) + 1);
};

// wrapper for browser navigation without reloading the page
exports.navigate = function navigate(browserPath) {
  const destination = browserPath.replace(PATH_REGEXP, '');
  browser.setLocation(destination);
};

// configures the chai assertion library
exports.configure = function configure(chai) {
  // enable promise chaining for chai assertions
  chai.use(chaiPromise);
};

// get the browser path after the hash
exports.getCurrentPath = function getCurrentPath() {
  return browser.getCurrentUrl()
    .then((url) => {
      const partial = url.split('#!')[1];
      partial.replace(PATH_REGEXP, '');
      return `#!${partial}`;
    });
};

/**
 * Adds screenshot to mochawesome test context on failure
 */
// eslint-disable-next-line
exports.takeScreenshotOnFailure = function takeScreenshotOnFailure(done) {
  if (this.currentTest.state === 'failed') {
    const filePath = path.resolve(
      process.cwd(),
      `../test/artifacts/screenshots/${this.currentTest.title.concat('.png')}`
    );

    browser.takeScreenshot()
      .then(png => fs.writeFile(filePath, Buffer.from(png, 'base64')))
      .then(() => {
        addContext(this, filePath);
        done();
      });
  } else {
    done();
  }
};

// shared data
exports.data = {

  // location IDs for the location select component
  locations : [
    'DBE330B65CDE48308C30DC00ECCD1A5F', // Democratic Republic of the Congo
    'F6FC74697E5845CBB87CF08AF93EDADE', // Bas Congo,
    '0404E9EAEBD64F20B1F86DC9F9313450', // Tshikapa,
    '1F162A109F6747889EFFC1FEA42FCC9B', // kele
  ],
};
