/* global by */
const chai = require('chai');
const helpers = require('../shared/helpers');

const { expect } = chai;

const FU = require('../shared/FormUtils');
const PurchaseOrderPage = require('./purchases.page.js');
const components = require('../shared/components');

/*
 * Simple Tests for Purchase Orders
 */
describe('Purchase Orders', () => {
  const path = '#!/purchases/create';

  // navigate to the patient invoice page
  beforeEach(() => helpers.navigate(path));

  it('supports single item purchase orders', async () => {
    const page = new PurchaseOrderPage();

    // prepare the page with default supplier, description, etc
    await components.supplierSelect.set('SNEL');
    await FU.input('PurchaseCtrl.order.details.note', 'This is a brief description of what is going on');
    await components.dateEditor.set(new Date('2016-03-03'));

    // set the 'other' delivery method parameter
    await $('#other').click();

    // add the following inventory item
    await page.addInventoryItem(0, 'Quinine');

    // change the required quantities
    await page.adjustItemQuantity(0, 1);

    // change the prices
    await page.adjustItemPrice(0, 25);

    // make sure the submit button is not disabled
    expect(await page.btns.submit.isEnabled()).to.equal(true);

    // attempt to submit the page.
    await page.submit();

    await FU.exists(by.id('receipt-confirm-created'), true);
    await page.reset();
  });

  it('supports multi-item purchase orders', async () => {
    const page = new PurchaseOrderPage();

    // prepare the page with default supplier, description, etc
    await components.supplierSelect.set('SNEL');
    await FU.input('PurchaseCtrl.order.details.note', 'We need more penicillin');
    await components.dateEditor.set(new Date('2016-03-05'));

    // set the 'on-purchase' delivery method parameter
    await $('#on-purchase').click();

    // add a two rows to the grid
    await page.addRows(2);

    // the grid now has three rows
    expect(await page.getRows().count()).to.equal(3);

    // add two inventory items to each row (0-indexing)
    await page.addInventoryItem(0, 'Quinine');
    await page.addInventoryItem(1, '110016');
    await page.addInventoryItem(2, 'Multivitamine');

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
    expect(await page.btns.submit.isEnabled()).to.equal(true);

    // submit the page
    await page.submit();

    /** @todo - this can validate totals and receipt content in the future */
    await FU.exists(by.id('receipt-confirm-created'), true);
    await page.reset();
  });

  it('blocks submission if no supplier is available', async () => {
    const page = new PurchaseOrderPage();
    FU.input('PurchaseCtrl.order.details.note', 'We need more purchases.');

    // make sure the "add rows" button is still disabled
    expect(await page.btns.add.isEnabled()).to.equal(false);

    // make sure the "submit" button is still disabled
    expect(await page.btns.submit.isEnabled()).to.equal(false);
  });

  it('blocks submission for an invalid grid', async () => {
    const page = new PurchaseOrderPage();
    await page.btns.clear.click();

    // prepare the page with default supplier, description, etc
    await components.supplierSelect.set('SNEL');
    await FU.input('PurchaseCtrl.order.details.note', 'We need more purchases.');
    await components.dateEditor.set(new Date('2016-03-01'));

    // set the 'on-purchase' delivery method parameter
    await $('#on-purchase').click();

    // add two rows to grid.
    await page.addRows(1);

    await page.submit();

    // there should be a danger notification
    await components.notification.hasDanger();
  });


  it('Block selection if no products require a purchase order', async () => {
    const page = new PurchaseOrderPage();
    await page.btns.clear.click();

    // prepare the page with default supplier, description, etc
    await components.supplierSelect.set('SNEL');
    await FU.input('PurchaseCtrl.order.details.note', 'Optimal Purchase');
    await components.dateEditor.set(new Date('2016-03-01'));

    // set the 'on-purchase' delivery method parameter
    await $('#on-purchase').click();

    // click on buttom Optimal Purchase
    await page.optimalPurchase();

    // there should be a danger notification
    await components.notification.hasWarn();

    // FIX ME : At this point in the E2E testing process, there is no product that requires a purchase order
    // because they E2E purchase order test precedes the outbound order
  });
});
