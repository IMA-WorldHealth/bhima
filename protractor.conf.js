/* global by,browser, element */
const q = require('q');

// checks to see if we are running on a Continuous Integration environment
const isCI = process.env.TRAVIS_BUILD_NUMBER !== undefined;

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
    browserName : 'chrome',
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

// if we are running in a continuous integration environment, modify the options to
// use CI-specific rules.
if (isCI) {
  configureCI(config);
}


function configureCI(cfg) {
  // credentials for running on saucelabs
  cfg.sauceUser = process.env.SAUCE_USERNAME;
  cfg.sauceKey = process.env.SAUCE_ACCESS_KEY;

  // modify the browsers to use Travis identifiers
  cfg.multiCapabilities = [{
    browserName         : 'chrome',
    'tunnel-identifier' : process.env.TRAVIS_JOB_NUMBER,
    build               : process.env.TRAVIS_BUILD_NUMBER,
    name                : `bhima-${process.env.TRAVIS_BRANCH}`,
    tags                : [
      `node: ${process.env.TRAVIS_NODE_VERSION}`,
      `os: ${process.env.TRAVIS_OS_NAME}`,
    ],
  }];
}

// expose to the outside world
exports.config = config;
