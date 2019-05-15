/* global by */

const { expect } = require('chai');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');

describe('Countries Management', () => {
  const path = '#!/locations/country';

  // navigate to the page before the test suite
  before(() => helpers.navigate(path));

  const country = { name : 'New Country' };

  it('creates a new country', async () => {
    await FU.buttons.create();

    await FU.input('CountryCtrl.country.name', country.name);

    // submit the page to the server
    await FU.buttons.submit();

    // expect a nice validation message
    await FU.exists(by.id('create_success'), true);
  });


  it('edits a country', async () => {
    await $(`[data-country-name="${country.name}"]`).click();

    // modify the country name
    await FU.input('CountryCtrl.country.name', 'Country Update');

    // submit the page to the server
    await FU.buttons.submit();

    // make sure the success message appears
    await FU.exists(by.id('update_success'), true);
  });

  it('blocks invalid form submission with relevant error classes', async () => {

    // switch to the create form
    await FU.buttons.create();

    // verify form has not been successfully submitted
    expect(await helpers.getCurrentPath()).to.equal(path);

    // submit the page to the server
    await FU.buttons.submit();

    // the following fields should be required
    await FU.validation.error('CountryCtrl.country.name');
  });
});
