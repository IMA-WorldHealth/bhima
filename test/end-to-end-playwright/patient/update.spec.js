const { chromium } = require('playwright');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');
const components = require('../shared/components');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Patient Edit', () => {
  const patient = '81af634f-321a-40de-bc6f-ceb1167a9f65';
  const path = `/#!/patients/${patient}/edit`;

  test.beforeEach(async () => {
    await TU.navigate(path, { waitUntil : 'domcontentloaded' });
  });

  test('ignores and warns for submission with no changes', async () => {
    await TU.buttons.submit();
    await components.notification.hasWarn();
  });

  test('updates a patients details', async () => {
    // required information
    await TU.input('PatientEditCtrl.medical.display_name', 'Updated Last Name');

    // optional information
    await TU.input('PatientEditCtrl.medical.title', 'Mr.');
    await TU.input('PatientEditCtrl.medical.email', 'update@email.com');
    await TU.buttons.submit();
    await components.notification.hasSuccess();
  });

  test('updates a patients debtor group subscription', async () => {
    // opens update modal
    await TU.locator('[data-update-group-debtor]').click();
    await components.debtorGroupSelect.set('NGO IMA World Health');

    await TU.modal.submit();
    await components.notification.hasSuccess();
  });

  test('updates a patients group subscriptions', async () => {
    await TU.locator('[data-update-group-patient]').click();
    await TU.locator('[data-group-option]').nth(1).click();
    await TU.modal.submit();
    await components.notification.hasSuccess();
  });
});
