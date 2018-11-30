/* global by */

const { expect } = require('chai');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');

describe('Countries Management', () => {

  const path = '#!/locations/country';

  // navigate to the page before the test suite
  before(() => helpers.navigate(path));

  const country = { name : 'New Country' };

  it('creates a new country', () => {
    FU.buttons.create();

    FU.input('CountryCtrl.country.name', country.name);

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });


  it('edits a country', () => {
    $(`[data-country-name="${country.name}"]`).click();

    // modify the country name
    FU.input('CountryCtrl.country.name', 'Country Update');

    // submit the page to the server
    FU.buttons.submit();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('blocks invalid form submission with relevant error classes', () => {

    // switch to the create form
    FU.buttons.create();

    // verify form has not been successfully submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    // submit the page to the server
    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('CountryCtrl.country.name');
  });
});
