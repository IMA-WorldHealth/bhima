/* global element, by, browser */

const FU = require('../../shared/FormUtils');
const GU = require('../../shared/GridUtils');

function InvoiceRegistryPage() {
  const page = this;

  const gridId = 'invoice-registry';

  function getInvoiceNumber() {
    return GU.getRows(gridId).count();
  }

  /**
   * @param {number} n the index of the row
   * @param {string} actionType invoiceReceipt|creditNoteReceipt|createCreditNote
   */
  function clickOnMethod(n, actionType) {
    const receiptColumnNumber = 6;

    // get the proper cell
    const cell = GU.getCell(gridId, n, receiptColumnNumber);

    // click the dropdown toggle
    cell.element(by.css('[uib-dropdown-toggle]')).click();

    // find the correct list and select the correct method
    $(`[data-list="${n}"]`).$(`[data-method="${actionType}"]`).click();
  }

  page.getInvoiceNumber = getInvoiceNumber;
  page.clickOnMethod = clickOnMethod;
}

module.exports = InvoiceRegistryPage;
