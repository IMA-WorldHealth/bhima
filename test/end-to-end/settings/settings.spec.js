/* global element, by */
const { expect } = require('chai');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');


describe('Settings', () => {
  before(() => helpers.navigate('#!/settings'));

  it('loads the page, and selects a language', async () => {
    // confirm that we can change the languages (to French)
    // ideally, we should check that the language changed, but this
    // test should only confirm that things are open.
    await FU.select('SettingsCtrl.settings.language', 'Fr');
  });

  it('uses the back button to return to previous state', async () => {
    const start = '#!/';
    const btn = by.css('[data-back-button]');

    // load the settings page w/o backwards navigation
    await helpers.navigate(start);
    await helpers.navigate('#!/settings');

    // ensure we navigate back to the main page.
    expect(await helpers.getCurrentPath()).to.equal('#!/settings');

    // click the back button
    await element(btn).click();

    // ensure we navigate back to the main page.
    expect(await helpers.getCurrentPath()).to.equal(start);
  });
});
