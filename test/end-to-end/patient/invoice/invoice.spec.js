/* global by, browser */

const { expect } = require('chai');
const helpers = require('../../shared/helpers');
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
describe('Patient Invoice', () => {
  const path = '#!/invoices/patient';

  // navigate to the patient invoice page
  before(() => helpers.navigate(path));

  it('invoices a patient for a single item', async () => {
    const page = new PatientInvoicePage();

    // prepare the page with default patient, service, etc
    await page.prepare();

    // add the following inventory item
    await page.addInventoryItem(0, '100099');

    // make sure the submit button is not disabled
    expect(await page.btns.submit.isEnabled()).to.eventually.equal(true);

    // attempt to submit the page.
    await page.submit();

    await FU.exists(by.id('receipt-confirm-created'), true);
    await page.reset();
  });

  it('invoices a patient for multiple items', async () => {
    const page = new PatientInvoicePage();

    // prepare the page with default patient, service, etc
    await page.prepare();

    // add a two rows to the grid
    await page.addRows(2);

    // the grid now has three rows
    expect(await page.getRows().count()).to.eventually.equal(3);

    // add two inventory items to each row (0-indexing)
    await page.addInventoryItem(0, '100099');
    await page.addInventoryItem(1, '110016');
    await page.addInventoryItem(2, '170448');

    // change the required quantities
    await page.adjustItemQuantity(0, 17);
    await page.adjustItemQuantity(1, 12);
    await page.adjustItemQuantity(2, 56);

    // change the prices
    await page.adjustItemPrice(0, 3.12);
    await page.adjustItemPrice(1, 15.13);
    await page.adjustItemPrice(2, 0.13);

    // adjust the item quantity again, for good measure
    await page.adjustItemQuantity(2, 46);

    // make sure the submit button is not disabled
    expect(await page.btns.submit.isEnabled()).to.eventually.equal(true);

    // submit the page
    await page.submit();

    /** @todo - this can validate totals and receipt content in the future */
    await FU.exists(by.id('receipt-confirm-created'), true);
    await page.reset();
  });

  it('blocks submission if no patient is available', async () => {
    const page = new PatientInvoicePage();

    // this patient doesn't exist
    await page.patient('TPA1.1');

    // make sure the "add rows" button is still disabled
    expect(await page.btns.add.isEnabled(), 'The add rows button is not disabled').to.eventually.equal(false);
  });

  it('blocks submission for an invalid grid', async () => {
    const page = new PatientInvoicePage();
    await page.btns.clear.click();

    // set up a valid invoice
    await page.prepare();

    // add two rows to grid.
    await page.addRows(1);

    await page.submit();

    // there should be a danger notification
    await components.notification.hasDanger();
  });

  it('saves and loads cached items correctly', async () => {
    const page = new PatientInvoicePage();
    await page.btns.clear.click();

    await page.prepare();

    // add a two rows to the grid
    await page.addRows(1);

    // add two inventory items to each row (0-indexing)
    await page.addInventoryItem(0, '100099'); // Propantheline bromide15mg
    await page.addInventoryItem(1, '110016'); // Tylenol sirop (cold multivit)

    // change the required quantities
    await page.adjustItemQuantity(0, 1);
    await page.adjustItemQuantity(1, 2);

    // change the prices
    // make the form invalid by adjusting the final price to 0.00
    await page.adjustItemPrice(0, 1.11);
    await page.adjustItemPrice(1, 0.00);

    // submit the form and clear the error message
    await page.submit();

    await components.notification.hasDanger();

    // refresh the browser
    await browser.refresh();

    // need to have a patient to recover data
    await page.patient('PA.TPA.1');

    // click recover cache button
    await page.recover();

    // make sure that information was correctly recovered
    await page.expectRowCount(2);

    // make the price something more reasonable that validation will accept
    await page.adjustItemPrice(1, 2.22);

    await page.submit();

    await FU.exists(by.id('receipt-confirm-created'), true);
    await FU.modal.close();
  });

  // it('can calculate totals correctly');
});
