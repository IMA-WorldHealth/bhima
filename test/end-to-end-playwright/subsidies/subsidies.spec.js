const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const components = require('../shared/components');
const GridRow = require('../shared/GridRow');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Subsidies', () => {
  const path = '/#!/subsidies';

  test.beforeEach(async () => {
    TU.navigate(path);
  });

  const subsidy = {
    label       : 'IMA SUBSIDY',
    description : 'InterChrurch Medical Assistance',
    value       : 12.5,
  };

  test('creates a new subsidy', async () => {
    // switch to the create form
    await TU.buttons.create();
    await TU.input('SubsidyModalCtrl.subsidy.label', subsidy.label);
    await TU.input('SubsidyModalCtrl.subsidy.value', subsidy.value);
    await components.accountSelect.set('NGO');
    await TU.input('SubsidyModalCtrl.subsidy.description', subsidy.description);

    // submit the page to the server
    await TU.buttons.submit();

    // expect a nice validation message
    await components.notification.hasSuccess();
  });

  test('edits an subsidy', async () => {
    const row = new GridRow('IMA SUBSIDY');
    await row.dropdown();
    await row.edit();

    await TU.input('SubsidyModalCtrl.subsidy.label', 'Updated');
    await TU.input('SubsidyModalCtrl.subsidy.description', ' IMCK Tshikaji');

    await TU.buttons.submit();

    // make sure the success message appears
    await components.notification.hasSuccess();
  });

  test('blocks invalid form submission with relevant error classes', async () => {
    await TU.buttons.create();
    await TU.buttons.submit();

    // the following fields should be required
    await TU.validation.error('SubsidyModalCtrl.subsidy.label');
    await TU.validation.error('SubsidyModalCtrl.subsidy.value');

    // the following fields are not required
    await TU.validation.ok('SubsidyModalCtrl.subsidy.description');
    await TU.buttons.cancel();
  });

  test('deletes a subsidy', async () => {
    const row = new GridRow('Updated');
    await row.dropdown();
    await row.remove();

    // click the alert asking for permission
    await TU.buttons.submit();

    // make sure that the delete message appears
    await components.notification.hasSuccess();
  });

});
