const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const GU = require('../shared/GridUtils');
const GA = require('../shared/GridAction');

const components = require('../shared/components');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Invoicing Fees', () => {
  const path = '/#!/invoicing_fees';
  const gridId = 'InvoicingFeesGrid';

  test.beforeEach(async () => {
    await TU.navigate(path);
  });

  test('can create an invoicing fee', async () => {
    // click on the create button
    await TU.buttons.create();

    // anticipate that the form should come up
    await TU.exists('[name="InvoicingFeesForm"]', true);
    await components.accountSelect.set('75881010'); // 75881010 - Autres revenus

    await TU.input('InvoicingFeesFormCtrl.model.label', 'Value Added Tax');
    await TU.input('InvoicingFeesFormCtrl.model.description', 'A tax added for people who want value!');
    await TU.input('InvoicingFeesFormCtrl.model.value', 25);

    await TU.buttons.submit();

    await components.notification.hasSuccess();
    await GU.expectRowCount(gridId, 3);
  });

  test.skip('can update an invoicing fee', async () => {
    // get the cell with the update button and click it
    await GA.clickOnMethod(0, 5, 'edit', 'InvoicingFeesGrid');

    // expect the update form to load
    // @TODO: Debug why the edit form won't come up when the edit button is clicked on
    await TU.waitForSelector('[name="InvoicingFeesForm"]');

    // update the label
    await TU.input('InvoicingFeesFormCtrl.model.label', 'Value Reduced Tax');

    // submit the form
    await TU.buttons.submit();
    await components.notification.hasSuccess();
  });

  test('can delete a invoicing fee', async () => {
    // get the cell with the delete button and click it
    await GA.clickOnMethod(0, 5, 'delete', 'InvoicingFeesGrid');

    // Wait for the modal to appear
    await TU.waitForSelector('[data-confirm-modal]');

    // Click on the confirm button
    await components.modalAction.confirm();

    await components.notification.hasSuccess();
    await GU.expectRowCount(gridId, 2);
  });

});
