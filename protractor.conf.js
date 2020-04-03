/* global browser, element, by */
const q = require('q');

// we want to make sure we run tests locally, but TravisCI
// should run tests on it's own driver.  To find out if it
// is Travis loading the configuration, we parse the
// process.env.TRAVIS_BUILD_NUMBER and reconfigure for travis
// as appropriate.

const config = {
  specs : ['test/end-to-end/**/*.spec.js'],

  // SELENIUM_PROMISE_MANAGER : false,

  framework : 'mocha',
  baseUrl   : 'http://localhost:8080/',

  mochaOpts : {
    reporter : 'spec',
    bail : true,
    timeout : 45000, // 45 second timeout
  },

  localSeleniumStandaloneOpts : {
    loopback : true,
  },

  // default browsers to run
  capabilities : {
    browserName : 'chrome',
    chromeOptions : {
      args : ['--window-size=1280,1024'],
    },
  },

  plugins : [{
    package : 'protractor-console-plugin',
    failOnError : false,
  }],

  // this will log the user in to begin with
  onPrepare : () => {
    return q.fcall(async () => {
      await browser.get('http://localhost:8080/#!/login');

      // Turns off ng-animate animations for all elements in the
      await element(by.css('body')).allowAnimations(false);

      await element(by.model('LoginCtrl.credentials.username')).sendKeys('superuser');
      await element(by.model('LoginCtrl.credentials.password')).sendKeys('superuser');
      await element(by.css('[data-method="submit"]')).click();

      // NOTE - you may need to play with the delay time to get this to work properly
      // Give this plenty of time to run
    }).delay(3000);
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
      args : ['--headless', '--disable-gpu', '--window-size=1280,1024'],
    },
  }];

  delete config.capabilities;
  delete config.plugins;
}

// expose to the outside world
exports.config = config;
