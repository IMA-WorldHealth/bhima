/* global by */

const { expect } = require('chai');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');

describe('Villages Management', () => {
  const path = '#!/locations/village';
  before(() => helpers.navigate(path));

  const village = {
    country : 'République Démocratique du Congo',
    province : 'Kinshasa',
    sector : 'Lukunga',
    name : 'New Village',
  };

  it('creates a new village', async () => {
    // switch to the create form
    await FU.buttons.create();

    await FU.select('VillageCtrl.village.country_uuid', village.country);
    await FU.select('VillageCtrl.village.province_uuid', village.province);
    await FU.select('VillageCtrl.village.sector_uuid', village.sector);
    await FU.input('VillageCtrl.village.name', village.name);

    // submit the page to the server
    await FU.buttons.submit();

    // expect a nice validation message
    await FU.exists(by.id('create_success'), true);
  });

  it('edits a village', async () => {

    // click the edit button
    await $(`[data-village-name="${village.name}"]`).click();

    // update a country
    await FU.select('VillageCtrl.village.country_uuid', village.country);
    await FU.select('VillageCtrl.village.province_uuid', village.province);
    await FU.select('VillageCtrl.village.sector_uuid', village.sector);
    await FU.input('VillageCtrl.village.name', 'Village Update');

    await FU.buttons.submit();

    // make sure the success message appears
    await FU.exists(by.id('update_success'), true);
  });

  it('correctly blocks invalid form submission with relevant error classes', async () => {

    // switch to the create form
    await FU.buttons.create();

    // verify form has not been submitted
    await expect(helpers.getCurrentPath()).to.eventually.equal(path);

    // submit the page to the server
    await FU.buttons.submit();

    // the following fields should be required
    await FU.validation.error('VillageCtrl.village.country_uuid');
    await FU.validation.error('VillageCtrl.village.province_uuid');
    await FU.validation.error('VillageCtrl.village.sector_uuid');
    await FU.validation.error('VillageCtrl.village.name');
  });
});
