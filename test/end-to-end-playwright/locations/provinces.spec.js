const { chromium } = require('playwright');
const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');
const GU = require('../shared/GridUtils');
const GridRow = require('../shared/GridRow');
const components = require('../shared/components');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Provinces Management', () => {
  const path = '/#!/locations/province';

  test.beforeAll(async () => {
    await TU.navigate(path);
  });

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

  test('Merge Province', async () => {
    // Prevent merging with no province selected
    const mergeBad1 = await TU.locator(`[data-method="merge"]`);
    await mergeBad1.click();
    await components.notification.hasWarn();

    // Prevent merging with less than two provinces
    await GU.selectRow(gridId, 1);
    const mergeBad2 = await TU.locator(`[data-method="merge"]`);
    await mergeBad2.click();
    await components.notification.hasWarn();

    // Prevent merging with more than two provinces
    await GU.selectRow(gridId, 16);
    await GU.selectRow(gridId, 3);
    const mergeBad3 = await TU.locator(`[data-method="merge"]`);
    await mergeBad3.click();
    await components.notification.hasWarn();

    // Merging success
    await GU.selectRow(gridId, 3);
    const merge = await TU.locator(`[data-method="merge"]`);
    merge.click();
    const location = await TU.locator(`[data-reference="${referenceLocation}"]`);
    await location.click();

    await TU.buttons.submit();
    await components.notification.hasSuccess();
  });

  test('creates a new province', async () => {
    // switch to the create form
    await TU.buttons.create();

    await TU.select('ModalCtrl.province.country_uuid', province.country);
    await TU.input('ModalCtrl.province.name', province.name);

    // submit the page to the server
    await TU.buttons.submit();
    // make sure the success message appears
    await components.notification.hasSuccess();
  });

  test('edits a province', async () => {
    const menu = dropdownMenu(province.name);
    await menu.dropdown();
    await menu.edit();

    await TU.select('ModalCtrl.province.country_uuid', province.country);
    await TU.input('ModalCtrl.province.name', 'Province Update');

    await TU.buttons.submit();

    // make sure the success message appears
    await components.notification.hasSuccess();
  });

  test('creates another province', async () => {

    // switch to the create form
    TU.buttons.create();

    await TU.select('ModalCtrl.province.country_uuid', province2.country);
    await TU.input('ModalCtrl.province.name', province2.name);
    // submit the page to the server
    await TU.buttons.submit();

    // expect a nice validation message
    await components.notification.hasSuccess();
  });

  test('should delete the test province', async () => {
    // click the edit button
    const menu = dropdownMenu(province2.name);
    await menu.dropdown();
    await menu.remove();

    await TU.buttons.submit();
    await components.notification.hasSuccess();
  });

  test('blocks invalid form submission with relevant error classes', async () => {
    // switch to the create form
    await TU.buttons.create();

    // verify form has not been successfully submitted
    expect(TU.getCurrentPath()).toBe(path);

    // submit the page to the server
    await TU.buttons.submit();

    // the following fields should be required
    await TU.validation.error('ModalCtrl.province.country_uuid');
    await TU.validation.error('ModalCtrl.province.name');

    await TU.buttons.cancel();
  });

  function dropdownMenu(label) {
    return new GridRow(label);
  }

});
