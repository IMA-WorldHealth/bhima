const { chromium } = require('playwright');
const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

// ??? const EC = protractor.ExpectedConditions;

const components = require('../shared/components');
const { promises } = require('dns');

test.describe('Debtor Groups Management', () => {
  const INITIAL_GROUPS = 3;
  const DELETEABLE_DEBTOR_GROUP = 'A11E6B7FFBBB432EAC2A5312A66DCCF4';

  const root = '/#/debtors/groups';

  test.beforeEach(async () => {
    await TU.navigate(root);
    // Wait until the debtor groups appear
    await TU.waitForSelector('[data-group-entry]');
  });

  // helper to quickly get a group by uuid
  const getGroupRow = (uuid) => TU.locator(`[data-group-entry="${uuid}"]`);

  const numGroups = () => TU.locator('[data-group-entry]').count();

  test('lists base test debtor groups', async () => {
    expect(await numGroups()).toBe(INITIAL_GROUPS);
  });

  test('creates a debtor group', async () => {
    await TU.buttons.create();

    await TU.input('GroupUpdateCtrl.group.name', 'E2E Debtor Group');

    await TU.uiSelect('GroupUpdateCtrl.group.color', 'bisque');

    await components.accountSelect.set('41111010'); // CHURCH
    await TU.input('GroupUpdateCtrl.group.max_credit', '1200');
    await TU.input('GroupUpdateCtrl.group.note', 'This debtor group was created by an automated end to end test.');
    await TU.input('GroupUpdateCtrl.group.phone', '+243 834 443');
    await TU.input('GroupUpdateCtrl.group.email', 'e2e@email.com');

    await TU.select('GroupUpdateCtrl.group.price_list_uuid', 'Test Price List');

    await TU.buttons.submit();

    await components.notification.hasSuccess();

    expect(await numGroups()).toBe(INITIAL_GROUPS + 1);
  });

  test('deletes a debtor group', async () => {
    // find the group by uuid
    const group = getGroupRow(DELETEABLE_DEBTOR_GROUP);

    // delete the creditor group
    await group.locator('[data-method="update"]').click();

    // click the "delete" button
    await TU.buttons.delete();

    // submit the confirmation modal
    await TU.modal.submit();

    await components.notification.hasSuccess();
  });

  test('updates a debtor group', async () => {
    const groups = await TU.locator('[data-group-entry]').all();
    await groups[0].locator('[data-method="update"]').click();
    // await updateGroup.all('[data-method="update"]').first().click();

    await TU.input('GroupUpdateCtrl.group.max_credit', '500');
    await TU.input('GroupUpdateCtrl.group.name', '[Updated]');

    await TU.buttons.submit();

    await components.notification.hasSuccess();
  });

  test('updates debtor group invoicing fee subscriptions', async () => {
    const groups = await TU.locator('[data-group-entry]').all();
    await groups[0].locator('[data-method="update"]').click();

    await TU.locator('#invoicingFeeSubscription').click();

    await TU.waitForSelector('[data-group-option="Test Invoicing Fee"]');
    await TU.locator('[data-group-option="Test Invoicing Fee"]').click();

    await TU.modal.submit();
    await components.notification.hasSuccess();
  });

  test('updates debtor group subsidy subscriptions', async () => {
    const groups = await TU.locator('[data-group-entry]').all();
    await groups[0].locator('[data-method="update"]').click();

    await TU.locator('#subsidySubscription').click();
    // Chose all subsidy options
    const subsidies = await TU.locator('[data-group-option]').all();
    await Promise.all(subsidies.map(opt => opt.setChecked(true)));

    await TU.modal.submit();
    await components.notification.hasSuccess();

    // Open the subscriptions dialog again and verify that all options are selected
    await TU.locator('#subsidySubscription').click();
    const newsubs = await TU.locator('[data-group-option]').all();
    const checks = await Promise.all(newsubs.map(opt => opt.isChecked()));
    expect(checks.every(chk => chk === true), 'Setting all subsidy options failed');
  });
});
