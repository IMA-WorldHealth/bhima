/* jshint expr:true */
/* global element, by, browser */

var chai = require('chai');
var expect = chai.expect;

var helpers = require('../shared/helpers');
helpers.configure(chai);

var FU = require('../shared/FormUtils');
var GU = require('../shared/gridTestUtils.spec.js');
var PatientInvoicePage = require('./invoice.page.js');

/**
 * Simple Tests for Patient Invoicing
 *
 * TODO
 *   - Test for billing services
 *   - Test for price list
 *   - Test for discount
 */
describe('patient invoice', function () {
  'use strict';

  /** @const */
  var path = '#/invoices/patient';

  // navigate to the patient invoice page
  beforeEach(function () {
    browser.get(path);
  });

  it.skip('invoices a patient for a single item', function () {
    var page = new PatientInvoicePage();

    // prepare the page with default patient, service, etc
    page.prepare();

    // add the following inventory item
    page.addInventoryItem(0, 'INV0');

    // make sure the submit button is not disabled
    expect(page.btns.submit.isEnabled()).to.eventually.equal(true);

    // attempt to submit the page.
    page.submit();
    
    /** @todo - this can validate totals and receipt content in the future */
    browser.waitForAngular();
    FU.exists(by.id('receipt'), true); 
  });

  it.skip('invoices a patient for multiple items', function () {
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
  
    browser.waitForAngular();
    /** @todo - this can validate totals and receipt content in the future */
    FU.exists(by.id('receipt'), true); 

  });


  it('blocks submission if no patient is available', function () {

    // get a new page
    var page = new PatientInvoicePage();

    // this patientdoesn exist
    page.patient('TPA1.1');

    // make sure the "add rows" button is still disabled
    expect(page.btns.add.isEnabled()).to.eventually.equal(false);

    // make sure the "submit" button is still disabled
    expect(page.btns.submit.isEnabled()).to.eventually.equal(false);
  });

  it.skip('blocks submission for an invalid grid', function () {

    // get a new page
    var page = new PatientInvoicePage();

    // set up a valid invoice
    page.prepare();

    // add two rows to grid.
    page.addRows(1);

    // make sure the button is still disabled
    expect((page.btns.submit.isEnabled())).to.eventually.equal(false);
  });

  it('shows appropriate error messages for required data');

  it('can calculate totals correctly');
});
