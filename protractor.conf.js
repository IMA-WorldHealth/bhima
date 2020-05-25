/* global browser, element, by */
const q = require('q');

// we want to make sure we run tests locally, but TravisCI
// should run tests on it's own driver.  To find out if it
// is Travis loading the configuration, we parse the
// process.env.TRAVIS and reconfigure for travis
// as appropriate.

const config = {
  specs : ['test/end-to-end/**/*.spec.js'],

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
      args : ['--disable-gpu', '--window-size=1280,1024'],
    },
  },

  // this will log the user in to begin with
  onPrepare : () => {
    return q.fcall(async () => {

      await browser.driver.manage().window().maximize();

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

// configuration for running on BrowserStack via Travis
if (process.env.TRAVIS) {
  delete config.plugins;
  delete config.capabilities;

  config.browserstackUser = process.env.BROWSERSTACK_USERNAME;
  config.browserstackKey = process.env.BROWSERSTACK_ACCESS_KEY;

  // report directory on the server(ubuntu)
  process.env.REPORT_DIR = '/opt/reports/';

  // modify the browsers to use Travis identifiers
  config.multiCapabilities = [{
    build : process.env.TRAVIS_BUILD_NUMBER,
    'browserstack.localIdentifier' : process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
    resolution : '1920x1080',
    'browserstack.debug' : 'true',
    os : 'Windows',
    os_version : '10',
    browserName : 'Chrome',
    browser_version : '81.0',
    'browserstack.local' : true,
    'browserstack.timezone' : '\'Africa/Kinshasa\'',
    'browserstack.selenium_version' : '3.5.2',
  }];

}

// expose to the outside world
exports.config = config;
