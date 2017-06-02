/* global by */
const chai = require('chai');
const GU = require('../../shared/GridUtils');

const expect = chai.expect;

const RECEIPT_COLUMN_NUMBER = 6;

class InvoiceRegistryPage {
  constructor() {
    this.gridId = 'invoice-registry';
  }

  getInvoiceNumber() {
    return GU.getRows(this.gridId).count();
  }

  /**
   * @param {number} n the index of the row
   * @param {string} actionType invoiceReceipt|creditNoteReceipt|createCreditNote
   */
  clickOnMethod(n, actionType) {
    // get the proper cell
    const cell = GU.getCell(this.gridId, n, RECEIPT_COLUMN_NUMBER);

    // click the dropdown toggle
    cell.element(by.css('[uib-dropdown-toggle]')).click();

    // find the correct list and select the correct method
    $(`[data-list="${n}"]`).$(`[data-method="${actionType}"]`).click();
  }

  // asserts that the grid has a certain number of rows
  expectNumberOfGridRows(number) {
    expect(this.getInvoiceNumber(),
      `Expected Invoice Registry's ui-grid row count to be ${number}.`
    ).to.eventually.equal(number);
  }
}

module.exports = InvoiceRegistryPage;
