/* global by,browser, element */
const q = require('q');

// we want to make sure we run tests locally, but TravisCI
// should run tests on it's own driver.  To find out if it
// is Travis loading the configuration, we parse the
// process.env.TRAVIS_BUILD_NUMBER and reconfigure for travis
// as appropriate.

const config = {

  specs : ['test/end-to-end/**/*.spec.js'],

  framework : 'mocha',
  baseUrl   : 'http://localhost:8080/',

  mochaOpts : {
    reporter        : 'mochawesome-screenshots',
    reporterOptions : {
      reportDir            : `${__dirname}/test/artifacts/`,
      reportName           : 'mochawesome-end-to-end',
      reportTitle          : 'Bhima End to End Tests',
      takePassedScreenshot : false,
      clearOldScreenshots  : true,
      jsonReport           : false,
    },
    timeout : 30000,
  },

  // default browsers to run
  multiCapabilities : [{
    // 'browserName': 'firefox',
 // }, {
    'browserName': 'chrome',
  }],

  // this will log the user in to begin with
  onPrepare : function () {
    return q.fcall(function () {
      browser.get('http://localhost:8080/#!/login');

      element(by.model('LoginCtrl.credentials.username')).sendKeys('superuser');
      element(by.model('LoginCtrl.credentials.password')).sendKeys('superuser');
      element(by.css('[data-method="submit"]')).click();

      // NOTE - you may need to play with the delay time to get this to work properly
      // Give this plenty of time to run
    }).delay(3100);
  },
};

// configuration for running on SauceLabs via Travis
if (process.env.TRAVIS_BUILD_NUMBER) {
  // SauceLabs credentials
  config.sauceUser = process.env.SAUCE_USERNAME;
  config.sauceKey = process.env.SAUCE_ACCESS_KEY;

  // modify the browsers to use Travis identifiers
  config.multiCapabilities = [{
    // 'browserName': 'firefox',
    //  'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    //  'build': process.env.TRAVIS_BUILD_NUMBER,
  // }, {
    browserName         : 'chrome',
    'tunnel-identifier' : process.env.TRAVIS_JOB_NUMBER,
    build               : process.env.TRAVIS_BUILD_NUMBER,
  }];

  // make Travis take screenshots!
  config.mochaOpts = {
    reporter        : 'mochawesome-screenshots',
    reporterOptions : {
      reportDir            : `${__dirname}/test/artifacts/`,
      reportName           : `protractor-${new Date().toDateString().replace(/\s/g,'-')}-${process.env.TRAVIS_BUILD_NUMBER}`,
      reportTitle          : 'Bhima End to End Tests',
      takePassedScreenshot : false,
      clearOldScreenshots  : true,
    },
    timeout : 30000,
  };
}

// expose to the outside world
exports.config = config;
