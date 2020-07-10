/* global element, by */

const { expect } = require('chai');
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');
const GridRow = require('../shared/GridRow');

describe('Villages Management', () => {
  const path = '#!/locations/village';
  before(() => helpers.navigate(path));

  const village = {
    country : 'République Démocratique du Congo',
    province : 'Kinshasa',
    sector : 'Lukunga',
    name : 'New Village',
  };
  const village2 = village;
  village2.name = 'test_village';

  const gridId = 'village-grid';
  const referenceLocation = 'Gombe';

  it('Merge village', async () => {
    // Prevent mixing with no village selected
    await element(by.css(`[data-method="merge"]`)).click();
    await components.notification.hasWarn();

    // Prevent mixing with less than two villages
    await GU.selectRow(gridId, 0);
    await element(by.css(`[data-method="merge"]`)).click();
    await components.notification.hasWarn();

    // Prevent mixing with more than two villages
    await GU.selectRow(gridId, 1);
    await GU.selectRow(gridId, 2);
    await element(by.css(`[data-method="merge"]`)).click();
    await components.notification.hasWarn();

    // Merging succes
    await GU.selectRow(gridId, 2);
    await element(by.css(`[data-method="merge"]`)).click();
    await element(by.css(`[data-reference="${referenceLocation}"]`)).click();

    await FU.buttons.submit();
    await components.notification.hasSuccess();

    // Merging succes
    await GU.selectRow(gridId, 0);
    await GU.selectRow(gridId, 1);
    await element(by.css(`[data-method="merge"]`)).click();
    await element(by.css(`[data-reference="${referenceLocation}"]`)).click();

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('creates a new village', async () => {
    // switch to the create form
    await FU.buttons.create();

    await FU.select('ModalCtrl.village.country_uuid', village.country);
    await FU.select('ModalCtrl.village.province_uuid', village.province);
    await FU.select('ModalCtrl.village.sector_uuid', village.sector);
    await FU.input('ModalCtrl.village.name', village.name);

    // submit the page to the server
    await FU.buttons.submit();

    // expect a nice validation message
    await components.notification.hasSuccess();
  });

  it('edits a village', async () => {
    // click the edit button
    const menu = await openDropdownMenu(village.name);
    await menu.edit().click();

    // update a country
    await FU.select('ModalCtrl.village.country_uuid', village.country);
    await FU.select('ModalCtrl.village.province_uuid', village.province);
    await FU.select('ModalCtrl.village.sector_uuid', village.sector);
    await FU.input('ModalCtrl.village.name', 'Village Update');

    await FU.buttons.submit();

    await components.notification.hasSuccess();
  });

  it('creates another village', async () => {

    // switch to the create form
    await FU.buttons.create();

    await FU.select('ModalCtrl.village.country_uuid', village2.country);
    await FU.select('ModalCtrl.village.province_uuid', village2.province);
    await FU.select('ModalCtrl.village.sector_uuid', village2.sector);
    await FU.input('ModalCtrl.village.name', village2.name);

    // submit the page to the server
    await FU.buttons.submit();

    // expect a nice validation message
    await components.notification.hasSuccess();
  });

  it('should delete the test village', async () => {
    // click the edit button
    const menu = await openDropdownMenu(village2.name);
    await menu.remove().click();

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('correctly blocks invalid form submission with relevant error classes', async () => {

    // switch to the create form
    await FU.buttons.create();

    // verify form has not been submitted
    expect(await helpers.getCurrentPath()).to.equal(path);

    // submit the page to the server
    await FU.buttons.submit();

    // the following fields should be required
    await FU.validation.error('ModalCtrl.village.country_uuid');
    await FU.validation.error('ModalCtrl.village.province_uuid');
    await FU.validation.error('ModalCtrl.village.sector_uuid');
    await FU.validation.error('ModalCtrl.village.name');
    await FU.buttons.cancel();
  });

  async function openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }
});
