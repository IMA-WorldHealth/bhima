const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const components = require('../shared/components');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Inventory Configuration', () => {
  const url = '/#/inventory/configuration';

  // // navigate to the page
  // test.beforeEach(async () => {
  //   await TU.navigate(url);
  // });

  const group = {
    name : 'Médicaments en Sirop Comprimes',
    code : '1700',
    sales_account : 'Vente Médicaments en comprimes',
    stock_account : 'Médicaments en comprimes',
    cogs_account  : 'Achat Médicaments',
    expires : 1,
    unique_item : 0,
  };

  const groupWithOnlySalesAccount = {
    name : 'Group With Only Sales Account',
    code : '1900',
    sales_account : '70611012', // Hospitalisation
  };

  const updateGroup = {
    name : '[E2E] Inventory Group updated',
    code : '2500',
    sales_account : '70611011', // Optique
  };

  // inventory type
  const type = { text : '[E2E] Inventory Type' };
  const updateType = { text : '[E2E] Inventory Type updated' };

  // inventory unit
  const unit = { text : '[E2E] Inventory Unit', abbr : 'IUE2E' };
  const updateUnit = { text : '[E2E] Inventory Unit updated', abbr : 'IUu' };

  test.describe('Groups', () => {

    // navigate to the page
    test.beforeEach(async () => {
      await TU.navigate(url);
    });

    //   test('creates a new inventory group', async () => {
    //     await TU.locator('[data-create-group]').click();
    //     await TU.input('$ctrl.session.name', group.name);
    //     await TU.input('$ctrl.session.code', group.code);

    //     await components.accountSelect.set(group.sales_account, null, $('[data-sales-account]'), 'accountName');
    //     await components.accountSelect.set(group.stock_account, null, TU.locator('[data-stock-account]'), 'accountName');
    //     await components.accountSelect.set(group.cogs_account, null, TU.locator('[data-cogs-account]'), 'accountName');

    //     await TU.buttons.submit();
    //     await components.notification.hasSuccess();
    //   });

    //   test('updates an existing inventory group', async () => {
    //     await TU.locator(`[data-edit-group="${group.code}"]`).click();
    //     await TU.input('$ctrl.session.name', updateGroup.name);
    //     await TU.input('$ctrl.session.code', updateGroup.code);

    //     await components.accountSelect.set(updateGroup.sales_account, null, TU.locator('[data-sales-account]'));

    //     await TU.buttons.submit();
    //     await components.notification.hasSuccess();
    //   });

    //   test('deletes an existing inventory group', async () => {
    //     await TU.locator(`[data-delete-group="${updateGroup.code}"]`).click();
    //     await TU.buttons.submit();
    //     await components.notification.hasSuccess();
    //   });

    //   test('creates an inventory group with only a sales account', async () => {
    //     await TU.locator('[data-create-group]').click();
    //     await TU.input('$ctrl.session.name', groupWithOnlySalesAccount.name);
    //     await TU.input('$ctrl.session.code', groupWithOnlySalesAccount.code);

    //     await components.accountSelect.set(groupWithOnlySalesAccount.sales_account, null, TU.locator('[data-sales-account]'));

    //     await TU.buttons.submit();
    //     await components.notification.hasSuccess();
    //   });
    // });

    // // test inventory type
    // test.describe('Types', () => {
    //   // navigate to the page
    //   test.beforeEach(async () => TU.navigate(url));

    //   test('creates a new inventory type', async () => {
    //     await TU.locator('[data-create-type]').click();
    //     await TU.input('$ctrl.session.text', type.text);
    //     await TU.buttons.submit();
    //     await components.notification.hasSuccess();
    //   });

    //   test('updates an existing inventory type', async () => {
    //     await TU.locator(`[data-edit-type="${type.text}"]`).click();
    //     await TU.input('$ctrl.session.text', updateType.text);
    //     await TU.buttons.submit();
    //     await components.notification.hasSuccess();
    //   });

    //   test('deletes an existing inventory type', async () => {
    //     await TU.locator(`[data-delete-type="${updateType.text}"]`).click();
    //     await TU.buttons.submit();
    //     await components.notification.hasSuccess();
    //   });
    // });

    // // test inventory unit
    // test.describe('Units', () => {
    //   // navigate to the page
    //   test.beforeEach(async () => TU.navigate(url));

    //   test('creates a new inventory unit', async () => {
    //     await TU.locator('[data-create-unit]').click();
    //     await TU.input('$ctrl.session.text', unit.text);
    //     await TU.input('$ctrl.session.abbr', unit.abbr);
    //     await TU.buttons.submit();
    //     await components.notification.hasSuccess();
    //   });

    //   test('updates an existing inventory unit', async () => {
    //     await TU.locator(`[data-edit-unit="${unit.abbr}"]`).click();
    //     await TU.input('$ctrl.session.text', updateUnit.text);
    //     await TU.input('$ctrl.session.abbr', updateUnit.abbr);
    //     await TU.buttons.submit();
    //     await components.notification.hasSuccess();
    //   });

    //   test('deletes an existing inventory unit', async () => {
    //     await TU.locator(`[data-delete-unit="${updateUnit.abbr}"]`).click();
    //     await TU.buttons.submit();
    //     await components.notification.hasSuccess();
    //   });

  });

});
