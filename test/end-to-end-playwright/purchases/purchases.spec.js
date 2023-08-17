const moment = require('moment');
const { chromium } = require('@playwright/test');
const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

const PurchaseOrderPage = require('./purchases.page');
const components = require('../shared/components');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

/*
 * Simple Tests for Purchase Orders
 */
test.describe('Purchase Orders', () => {
  const path = '/#!/purchases/create';

  // navigate to the patient invoice page
  test.beforeEach(async () => {
    await TU.navigate(path);
  });

  test('supports single item purchase orders', async () => {
    const page = new PurchaseOrderPage();
    const datePurchase = moment(new Date(), 'YYYY-MM-DD').subtract(1712, 'days').toDate();

    // prepare the page with default supplier, description, etc
    await components.supplierSelect.set('SNEL');
    await TU.input('PurchaseCtrl.order.details.note', 'This is a brief description of what is going on');
    await components.dateEditor.set(datePurchase);

    // set the 'other' delivery method parameter
    await TU.locator('#other').click();

    // add the following inventory item
    await page.addInventoryItem(0, 'Quinine Bichlorhydrate, sirop, 100mg');

    // change the required quantities
    await page.adjustItemQuantity(0, 1);

    // change the prices
    await page.adjustItemPrice(0, 25);

    // make sure the submit button is not disabled
    expect(await page.submitButtonEnabled()).toBe(true);

    // attempt to submit the page.
    await page.submit();

    await TU.waitForSelector(by.id('receipt-confirm-created'));
    await page.reset();
  });

  test('supports multi-item purchase orders', async () => {
    const page = new PurchaseOrderPage();
    const datePurchase = moment(new Date(), 'YYYY-MM-DD').subtract(1710, 'days').toDate();

    // prepare the page with default supplier, description, etc
    await components.supplierSelect.set('SNEL');
    await TU.input('PurchaseCtrl.order.details.note', 'We need more penicillin');
    await components.dateEditor.set(datePurchase);

    // set the 'on-purchase' delivery method parameter
    await TU.locator('#on-purchase').click();

    // add a two rows to the grid
    await page.addRows(2);

    // the grid now has three rows
    expect((await page.getRows()).length).toBe(3);

    // add two inventory items to each row (0-indexing)
    await page.addInventoryItem(0, 'DDIS_FORM1T-_1');
    await page.addInventoryItem(1, 'DDIS_SOAP1P-_0');
    await page.addInventoryItem(2, 'EANT_SCAL16-_0');

    // change the required quantities
    await page.adjustItemQuantity(0, 7);
    await page.adjustItemQuantity(1, 25);
    await page.adjustItemQuantity(2, 14);

    // change the prices
    await page.adjustItemPrice(0, 0.12);
    await page.adjustItemPrice(1, 15.63);
    await page.adjustItemPrice(2, 21.37);

    // adjust the item quantity again, for good measure
    await page.adjustItemQuantity(2, 16);

    // make sure the submit button is not disabled
    expect(await page.submitButtonEnabled()).toBe(true);

    // submit the page
    await page.submit();

    /** @todo - this can validate totals and receipt content in the future */
    await TU.waitForSelector(by.id('receipt-confirm-created'));
    await page.reset();
  });

  test.skip('supports An optimal purchase orders', async () => {
    // @TODO : fix this test
    const page = new PurchaseOrderPage();
    const datePurchase = moment(new Date(), 'YYYY-MM-DD').subtract(1710, 'days').toDate();

    // prepare the page with default supplier, description, etc
    await components.supplierSelect.set('SNEL');
    await TU.input('PurchaseCtrl.order.details.note', 'Optimal Purchase Order');
    await components.dateEditor.set(datePurchase);

    // set the 'on-purchase' delivery method parameter
    await TU.locator('#on-purchase').click();

    // click on buttom Optimal Purchase
    await page.optimalPurchase();

    // the grid now has three rows
    expect((await page.getRows()).length).toBe(1);

    // change the prices
    await page.adjustItemPrice(0, 2.25);

    // make sure the submit button is not disabled
    expect(await page.submitButtonEnabled()).toBe(true);

    // submit the page
    await page.submit();

    /** @todo - this can validate totals and receipt content in the future */
    await TU.waitForSelector(by.id('receipt-confirm-created'));
    await page.reset();
  });

  test('blocks submission if no supplier is available', async () => {
    const page = new PurchaseOrderPage();

    TU.input('PurchaseCtrl.order.details.note', 'We need more purchases.');

    // make sure the "add rows" button is still disabled
    expect(await page.addButtonEnabled()).toBe(false);

    // make sure the "submit" button is still disabled
    expect(await page.submitButtonEnabled()).toBe(false);
  });

  test('blocks submission for an invalid grid', async () => {
    const page = new PurchaseOrderPage();
    const datePurchase = moment(new Date(), 'YYYY-MM-DD').subtract(1714, 'days').toDate();

    await page.btns.clear();

    // prepare the page with default supplier, description, etc
    await components.supplierSelect.set('SNEL');
    await TU.input('PurchaseCtrl.order.details.note', 'We need more purchases.');
    await components.dateEditor.set(datePurchase);

    // set the 'on-purchase' delivery method parameter
    await TU.locator('#on-purchase').click();

    // add two rows to grid.
    await page.addRows(1);

    await page.submit();

    // there should be a danger notification
    await components.notification.hasDanger();
  });

});
