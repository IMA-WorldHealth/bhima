/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('../../shared/helpers');
helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const PatientInvoicePage = require('./invoice.page.js');
const components = require('../../shared/components');

/*
 * Simple Tests for Patient Invoicing
 *
 * TODO
 *   - Test for billing services
 *   - Test for price list
 *   - Test for discount
 */
describe('Patient Invoice', function () {
  'use strict';

  const path = '#/invoices/patient';

  // navigate to the patient invoice page
  before(() => helpers.navigate(path));

  it('invoices a patient for a single item', function () {
    var page = new PatientInvoicePage();

    // prepare the page with default patient, service, etc
    page.prepare();

    // add the following inventory item
    page.addInventoryItem(0, 'INV0');

    // make sure the submit button is not disabled
    expect(page.btns.submit.isEnabled()).to.eventually.equal(true);

    // attempt to submit the page.
    page.submit();

    FU.exists(by.id('receipt-confirm-created'), true);
    page.reset();
  });

  it('invoices a patient for multiple items', function () {
    var page = new PatientInvoicePage();

    // prepare the page with default patient, service, etc
    page.prepare();

    // add a two rows to the grid
    page.addRows(2);

    // the grid now has three rows
    expect(page.getRows().count()).to.eventually.equal(3);

    // add two inventory items to each row (0-indexing)
    page.addInventoryItem(0, 'INV0');
    page.addInventoryItem(1, 'INV2');
    page.addInventoryItem(2, 'INV1');

    // change the required quantities
    page.adjustItemQuantity(0, 17);
    page.adjustItemQuantity(1, 12);
    page.adjustItemQuantity(2, 56);

    // change the prices
    page.adjustItemPrice(0, 3.12);
    page.adjustItemPrice(1, 15.13);
    page.adjustItemPrice(2, 0.13);

    // adjust the item quantity again, for good measure
    page.adjustItemQuantity(2, 46);

    // make sure the submit button is not disabled
    expect(page.btns.submit.isEnabled()).to.eventually.equal(true);

    // submit the page
    page.submit();

    /** @todo - this can validate totals and receipt content in the future */
    FU.exists(by.id('receipt-confirm-created'), true);
    page.reset();
  });

  it('blocks submission if no patient is available', function () {
    var page = new PatientInvoicePage();

    // this patient doesn't exist
    page.patient('TPA1.1');

    // make sure the "add rows" button is still disabled
    expect(page.btns.add.isEnabled()).to.eventually.equal(false);

    // make sure the "submit" button is still disabled
    expect(page.btns.submit.isEnabled()).to.eventually.equal(false);
  });

  it('blocks submission for an invalid grid', function () {
    var page = new PatientInvoicePage();
    page.btns.clear.click();

    // set up a valid invoice
    page.prepare();

    // add two rows to grid.
    page.addRows(1);

    page.submit();

    // there should be a danger notification
    components.notification.hasDanger();
  });

  it('saves and loads cached items correctly', function () {
    var page = new PatientInvoicePage();
    page.btns.clear.click();

    page.prepare();

    // add a two rows to the grid
    page.addRows(1);

    // add two inventory items to each row (0-indexing)
    page.addInventoryItem(0, 'INV0');
    page.addInventoryItem(1, 'INV2');

    // change the required quantities
    page.adjustItemQuantity(0, 1);
    page.adjustItemQuantity(1, 2);

    // change the prices
    page.adjustItemPrice(0, 1.11);
    page.adjustItemPrice(1, 2.22);

    const description = element(by.model('PatientInvoiceCtrl.Invoice.details.description'));

    // make the form invalid by clearing the description
    description.clear();

    // submit the form and clear the error message
    page.submit();
    components.notification.hasDanger();

    // refresh the browser
    browser.refresh();

    // need to have a patient to recover data
    page.patient('PA.TPA.1');

    // click recover cache button
    page.recover();

    // make sure that information was correctly recovered
    page.expectRowCount(2);

    description.sendKeys('A real description!');
    page.submit();
    FU.exists(by.id('receipt-confirm-created'), true);
    FU.modal.close();
  });

  //it('can calculate totals correctly');
});
