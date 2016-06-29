/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');
const PurchaseOrderPage = require('./purchases.page.js');
const components = require('../shared/components');

/*
 * Simple Tests for Purchase Orders
 */
describe('Purchase Orders', function () {
  'use strict';

  const path = '#/purchases/create';

  // navigate to the patient invoice page
  beforeEach(() => helpers.navigate(path));

  it('supports single item purchase orders', () => {
    var page = new PurchaseOrderPage();

    // prepare the page with default supplier, description, etc
    FU.typeahead('PurchaseCtrl.supplier', 'Test Supplier');
    FU.input('PurchaseCtrl.order.details.note', 'This is a brief description of what is going on');
    components.dateEditor.set(new Date('2016-03-03'));

    // set the 'other' delivery method parameter
    $('#other').click();

    // add the following inventory item
    page.addInventoryItem(0, 'INV0');

    // make sure the submit button is not disabled
    expect(page.btns.submit.isEnabled()).to.eventually.equal(true);

    // attempt to submit the page.
    page.submit();

    FU.exists(by.id('receipt-confirm-created'), true);
    page.reset();
  });

  it('supports multi-item purchase orders', function () {
    var page = new PurchaseOrderPage();

    // prepare the page with default supplier, description, etc
    FU.typeahead('PurchaseCtrl.supplier', 'Test Supplier');
    FU.input('PurchaseCtrl.order.details.note', 'We need more penicillin');
    components.dateEditor.set(new Date('2016-03-05'));

    // set the 'on-purchase' delivery method parameter
    $('#on-purchase').click();

    // add a two rows to the grid
    page.addRows(2);

    // the grid now has three rows
    expect(page.getRows().count()).to.eventually.equal(3);

    // add two inventory items to each row (0-indexing)
    page.addInventoryItem(0, 'INV0');
    page.addInventoryItem(1, 'INV2');
    page.addInventoryItem(2, 'INV1');

    // change the required quantities
    page.adjustItemQuantity(0, 7);
    page.adjustItemQuantity(1, 25);
    page.adjustItemQuantity(2, 14);

    // change the prices
    page.adjustItemPrice(0, 0.12);
    page.adjustItemPrice(1, 15.63);
    page.adjustItemPrice(2, 21.37);

    // adjust the item quantity again, for good measure
    page.adjustItemQuantity(2, 16);

    // make sure the submit button is not disabled
    expect(page.btns.submit.isEnabled()).to.eventually.equal(true);

    // submit the page
    page.submit();

    /** @todo - this can validate totals and receipt content in the future */
    FU.exists(by.id('receipt-confirm-created'), true);
    page.reset();
  });

  it('blocks submission if no supplier is available', function () {
    var page = new PurchaseOrderPage();

    // no such supplier
    FU.input('PurchaseCtrl.supplier', 'Harry Styles');

    // make sure the "add rows" button is still disabled
    expect(page.btns.add.isEnabled()).to.eventually.equal(false);

    // make sure the "submit" button is still disabled
    expect(page.btns.submit.isEnabled()).to.eventually.equal(false);
  });

  it('blocks submission for an invalid grid', function () {
    var page = new PurchaseOrderPage();
    page.btns.clear.click();

    // prepare the page with default supplier, description, etc
    FU.typeahead('PurchaseCtrl.supplier', 'Test Supplier');
    FU.input('PurchaseCtrl.order.details.note', 'We need more purchases.');
    components.dateEditor.set(new Date('2016-03-01'));

    // set the 'on-purchase' delivery method parameter
    $('#on-purchase').click();

    // add two rows to grid.
    page.addRows(1);

    page.submit();

    // there should be a danger notification
    components.notification.hasDanger();
  });
});
