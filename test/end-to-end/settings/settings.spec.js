/* global browser, element, by */
const chai = require('chai');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');

helpers.configure(chai);
const expect = chai.expect;

describe('Settings', () => {
  before(() => helpers.navigate('#!/settings'));

  it('loads the page, and selects a language', () => {
    // confirm that we can change the languages (to French)
    // ideally, we should check that the language changed, but this
    // test should only confirm that things are open.
    FU.select('SettingsCtrl.settings.language', 'Fr');
  });

  it('uses the back button to return to previous state', () => {
    const start = '#!/';
    const btn = by.css('[data-back-button]');

    // load the settings page w/o backwards navigation
    helpers.navigate(start);
    helpers.navigate('#!/settings');

    // ensure we navigate back to the main page.
    expect(helpers.getCurrentPath()).to.eventually.equal('#!/settings');

    // click the back button
    element(btn).click();

    // ensure we navigate back to the main page.
    expect(helpers.getCurrentPath()).to.eventually.equal(start);
  });
});
