/* global element, by */

const { expect } = require('chai');

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');
const GridRow = require('../shared/GridRow');

describe('Provinces Management', () => {
  const path = '#!/locations/province';

  before(() => helpers.navigate(path));

  const province = {
    country : 'République Démocratique du Congo',
    name : 'New Province',
  };

  const province2 = {
    country : 'République Démocratique du Congo',
    name : 'another Province',
  };

  const gridId = 'province-grid';
  const referenceLocation = 'Équateur';

  it('Merge Province', async () => {
    // Prevent mixing with no province selected
    await element(by.css(`[data-method="merge"]`)).click();
    await components.notification.hasWarn();

    // Prevent mixing with less than two provinces
    await GU.selectRow(gridId, 1);
    await element(by.css(`[data-method="merge"]`)).click();
    await components.notification.hasWarn();

    // Prevent mixing with more than two provinces
    await GU.selectRow(gridId, 16);
    await GU.selectRow(gridId, 3);
    await element(by.css(`[data-method="merge"]`)).click();
    await components.notification.hasWarn();

    // Merging succes
    await GU.selectRow(gridId, 3);
    await element(by.css(`[data-method="merge"]`)).click();
    await element(by.css(`[data-reference="${referenceLocation}"]`)).click();

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('creates a new province', async () => {
    // switch to the create form
    await FU.buttons.create();

    await FU.select('ModalCtrl.province.country_uuid', province.country);
    await FU.input('ModalCtrl.province.name', province.name);

    // submit the page to the server
    await FU.buttons.submit();
    // make sure the success message appears
    await components.notification.hasSuccess();
  });

  it('edits a province', async () => {
    const menu = await openDropdownMenu(province.name);
    await menu.edit().click();

    await FU.select('ModalCtrl.province.country_uuid', province.country);
    await FU.input('ModalCtrl.province.name', 'Province Update');

    await FU.buttons.submit();

    // make sure the success message appears
    await components.notification.hasSuccess();
  });

  it('creates another province', async () => {

    // switch to the create form
    FU.buttons.create();

    await FU.select('ModalCtrl.province.country_uuid', province2.country);
    await FU.input('ModalCtrl.province.name', province2.name);
    // submit the page to the server
    await FU.buttons.submit();

    // expect a nice validation message
    await components.notification.hasSuccess();
  });

  it('should delete the test province', async () => {
    // click the edit button
    const menu = await openDropdownMenu(province2.name);
    await menu.remove().click();

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('blocks invalid form submission with relevant error classes', async () => {
    // switch to the create form
    await FU.buttons.create();

    // verify form has not been successfully submitted
    expect(await helpers.getCurrentPath()).to.equal(path);

    // submit the page to the server
    await FU.buttons.submit();

    // the following fields should be required
    await FU.validation.error('ModalCtrl.province.country_uuid');
    await FU.validation.error('ModalCtrl.province.name');

    await FU.buttons.cancel();
  });

  async function openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }

});
