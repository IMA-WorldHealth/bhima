const path = require('path');
const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

const fixtures = path.resolve(__dirname, '../../fixtures/');

// routes used in tests
const location = 'enterprises';

test.beforeEach(async ({ page }) => {
  TU.registerPage(page);
  await TU.login();
  await TU.navigate(location);
});

test.describe('Enterprises', () => {

  // enterprise
  const enterprise = {
    name            : 'Interchurch Medical Assistance',
    abbr            : 'IMA',
    email           : 'ima@imaworldhealth.com',
    po_box          : 'POBOX USA 1',
    phone           : '01500',
    gain_account_id : 'Gain de change',
    loss_account_id : '67611010', // 67611010 - Différences de change
  };

  // default enterprise
  const defaultEnterprise = {
    name            : 'Test Enterprise',
    abbr            : 'TE',
    email           : 'enterprise@test.org',
    po_box          : 'POBOX USA 1',
    phone           : '243 81 504 0540',
    gain_account_id : 'Gain de change',
    loss_account_id : '67611010', // 67611010 - Différences de change
  };

  // project
  const abbr = suffix();
  const project = {
    name : `Test Project ${abbr}`,
    abbr,
  };

  // project update
  const abbrUpdate = suffix();
  const projectUpdate = {
    name : `Test Project Update ${abbrUpdate}`,
    abbr : abbrUpdate,
  };

  /**
   * The actual enterprise module doesn't need to create a new one
   * so we need only to update enterprise information
   */
  test('set enterprise data', async () => {
    await TU.input('EnterpriseCtrl.enterprise.name', enterprise.name);
    await TU.input('EnterpriseCtrl.enterprise.abbr', enterprise.abbr);

    await components.accountSelect.set(enterprise.gain_account_id, 'gain-account-id');
    await components.accountSelect.set(enterprise.loss_account_id, 'loss-account-id');

    await TU.input('EnterpriseCtrl.enterprise.po_box', enterprise.po_box);
    await TU.input('EnterpriseCtrl.enterprise.email', enterprise.email);
    await TU.input('EnterpriseCtrl.enterprise.phone', enterprise.phone);

    // select the locations specified
    await components.locationSelect.set(helpers.data.locations);

    // submit the page to the server
    await TU.buttons.submit();

    await components.notification.hasSuccess();
  });

  test('blocks invalid form submission with relevant error classes', async () => {
    await TU.input('EnterpriseCtrl.enterprise.name', '');
    await TU.input('EnterpriseCtrl.enterprise.abbr', '');

    TU.buttons.submit();

    // The following fields should be required
    await TU.validation.error('EnterpriseCtrl.enterprise.name');
    await TU.validation.error('EnterpriseCtrl.enterprise.abbr');

    // The following fields are not required
    await TU.validation.ok('EnterpriseCtrl.enterprise.email');
    await TU.validation.ok('EnterpriseCtrl.enterprise.po_box');
    await TU.validation.ok('EnterpriseCtrl.enterprise.phone');
  });

  test('reset enterprise data to default', async () => {
    await TU.input('EnterpriseCtrl.enterprise.name', defaultEnterprise.name);
    await TU.input('EnterpriseCtrl.enterprise.abbr', defaultEnterprise.abbr);

    await components.accountSelect.set(defaultEnterprise.gain_account_id, 'gain-account-id');
    await components.accountSelect.set(defaultEnterprise.loss_account_id, 'loss-account-id');

    await TU.input('EnterpriseCtrl.enterprise.po_box', defaultEnterprise.po_box);
    await TU.input('EnterpriseCtrl.enterprise.email', defaultEnterprise.email);
    await TU.input('EnterpriseCtrl.enterprise.phone', defaultEnterprise.phone);

    // select the locations specified
    await components.locationSelect.set(helpers.data.locations);

    // submit the page to the server
    await TU.buttons.submit();

    await components.notification.hasSuccess();
  });

  test('upload a new enterprise logo', async ({ page }) => {
    const fileToUpload = 'logo.ico';
    const absolutePath = path.resolve(fixtures, fileToUpload);
    const upload = await page.locator('input[type=file][name="logo"]');
    await upload.setInputFiles(absolutePath);
    await TU.buttons.submit();
    await components.notification.hasSuccess();

    // Verify the page has a new image
    await page.reload();
    await page.waitForSelector('div.logo');
    const count = await page.locator('div.logo img').count();
    expect(count, 'Logo image upload failed').toBe(1);
  });

  test('add a new project for the enterprise', async () => {
    await TU.buttons.create();

    await TU.input('$ctrl.project.name', project.name);
    await TU.input('$ctrl.project.abbr', project.abbr);

    await TU.modal.submit();

    await components.notification.hasSuccess();
  });

  test('edit an existing project', async ({ page }) => {
    await page.locator(`[data-project="${abbr}"] a[data-method="update"]`).click();
    await TU.input('$ctrl.project.name', projectUpdate.name);
    await TU.input('$ctrl.project.abbr', projectUpdate.abbr);

    await TU.modal.submit();

    await components.notification.hasSuccess();
  });

  test('delete an existing project', async ({ page }) => {
    // Pop up the project deletion dialog
    await page.locator(`[data-project="${projectUpdate.abbr}"] a[data-method="delete"]`).click();
    await TU.input('$ctrl.text', projectUpdate.name);
    await TU.modal.submit();

    await components.notification.hasSuccess();
  });

  /**
   * This function returns a random 3 characters string as an abbreviation
   *
   * @function suffix
   * @returns {string} random 3-letter suffix (A-Z)
   */
  function suffix() {
    const a = String.fromCharCode(random(65, 90));
    const b = String.fromCharCode(random(65, 90));
    const c = String.fromCharCode(random(65, 90));
    return `${a}${b}${c}`;
  }

  /**
   * Return a random number from a range
   *
   * @param {number} min - minimum value
   * @param {number} max - maximum value
   * @returns {number} random number between min and max (inclusive)
   */
  function random(min, max) {
    return Math.floor((Math.random() * ((max - min) + 1)) + min);
  }

});
