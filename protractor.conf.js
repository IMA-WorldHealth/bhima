/* global browser, element, by */
const q = require('q');
const chai = require('chai');
const helpers = require('./test/end-to-end/shared/helpers');

helpers.configure(chai);

// we want to make sure we run tests locally, but TravisCI
// should run tests on it's own driver.  To find out if it
// is Travis loading the configuration, we parse the
// process.env.TRAVIS_BUILD_NUMBER and reconfigure for travis
// as appropriate.

const config = {
  specs : ['test/end-to-end/**/*.spec.js'],

  // SELENIUM_PROMISE_MANAGER: false,

  framework : 'mocha',
  baseUrl   : 'http://localhost:8080/',

  mochaOpts : {
    // reporter        : 'mochawesome',
    reporterOptions : {
      reportDir            : `${__dirname}/test/artifacts/`,
      inline               : true,
      reportName           : 'end-to-end-tests',
      reportTitle          : 'Bhima End to End Tests',
      showPassed           : false,
    },
    bail : true,
    timeout : 45000, // 45 second timeout
  },

  // default browsers to run
  multiCapabilities : [{
    // 'browserName': 'firefox',
  // }, {
    browserName : 'chrome',
  }],

  // this will log the user in to begin with
  onPrepare : () => {
    return q.fcall(() => {
      browser.get('http://localhost:8080/#!/login');

      element(by.model('LoginCtrl.credentials.username')).sendKeys('superuser');
      element(by.model('LoginCtrl.credentials.password')).sendKeys('superuser');
      element(by.css('[data-method="submit"]')).click();

      // NOTE - you may need to play with the delay time to get this to work properly
      // Give this plenty of time to run
    }).delay(5000);
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
    chromeOptions : {
      args : [
        '--headless',
        '--window-size=1280,1024',
        '--disable-dev-shm-usage',
        '--disable-extensions',
      ],
    },
  }];

  config.mochaOpts = {
    reporter        : 'mochawesome',
    reporterOptions : {
      reportDir            : `${__dirname}/test/artifacts/`,
      inline               : true,
      reportName           : 'end-to-end-tests',
      reportTitle          : 'Bhima End to End Tests',
      showPassed           : false,
    },
    bail : true,
    timeout : 45000,
  };
}

// expose to the outside world
exports.config = config;
