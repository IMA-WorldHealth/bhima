/* global browser, element, by, protractor */

var chai = require('chai');
var expect = chai.expect;

// import testing utiliites
var helpers = require('../shared/helpers');
helpers.configure(chai);

var FU = require('../shared/FormUtils');

describe('Settings', function () {

  it('loads the page, and selects a language', function () {

    // load the settings page w/o backwards navigation
    browser.get('#/settings');

    // confirm that we can change the languages
    // ideally, we should check that the language changed, but this
    // test should only confirm that things are open.
    FU.select('SettingsCtrl.settings.language')
      .enabled()
      .last()
      .click();

    // make sure that the "back" button doesn't exist
    FU.exists(by.css('[data-back-button]'), false);
  });

  it('uses the back button to return to previous state', function () {

    // load the settings page w/o backwards navigation
    browser.get('#/settings?previous=index');

    var btn = '[data-back-button]';

    // make sure that the "back" button doesn't exist
    FU.exists(by.css(btn), true);

    // click the back button
    element(by.css(btn)).click();

    // ensure we navigate back to the main page.
    expect(helpers.getCurrentPath()).to.eventually.equal('#/');
  });
});
