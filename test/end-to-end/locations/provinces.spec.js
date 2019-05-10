/* global by */

const { expect } = require('chai');

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');

describe('Provinces Management', () => {
  const path = '#!/locations/province';

  before(() => helpers.navigate(path));

  const province = {
    country : 'République Démocratique du Congo',
    name : 'New Province',
  };

  it('creates a new province', async () => {
    // switch to the create form
    await FU.buttons.create();

    await FU.select('ProvinceCtrl.province.country_uuid', province.country);
    await FU.input('ProvinceCtrl.province.name', province.name);

    // submit the page to the server
    await FU.buttons.submit();

    // expect a nice validation message
    await FU.exists(by.id('create_success'), true);
  });

  it('edits a province', async () => {
    await $(`[data-province-name="${province.name}"]`).click();

    await FU.select('ProvinceCtrl.province.country_uuid', province.country);
    await FU.input('ProvinceCtrl.province.name', 'Province Update');

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
    await FU.validation.error('ProvinceCtrl.province.country_uuid');
    await FU.validation.error('ProvinceCtrl.province.name');
  });
});
