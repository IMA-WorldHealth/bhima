/* global browser, element, by */
const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Settings', function () {

  before(() => helpers.navigate('#/settings'));

  it('loads the page, and selects a language', function () {

    // confirm that we can change the languages (to French)
    // ideally, we should check that the language changed, but this
    // test should only confirm that things are open.
    FU.select('SettingsCtrl.settings.language', 'Fr');

    // make sure that the "back" button doesn't exist
    FU.exists(by.css('[data-back-button]'), false);
  });

  it('uses the back button to return to previous state', function () {

    // load the settings page w/o backwards navigation
    helpers.navigate('#/settings?previous=index');

    var btn = '[data-back-button]';

    // make sure that the "back" button doesn't exist
    FU.exists(by.css(btn), true);

    // click the back button
    element(by.css(btn)).click();

    // ensure we navigate back to the main page.
    expect(helpers.getCurrentPath()).to.eventually.equal('#/');
  });
});
