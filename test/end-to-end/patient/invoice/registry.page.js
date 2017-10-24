const GU = require('../../shared/GridUtils');
const GridRow = require('../../shared/GridRow');

class InvoiceRegistryPage {
  constructor() {
    this.gridId = 'invoice-registry';
    this.grid = GU.getGrid(this.gridId);
  }

  getInvoiceNumber() {
    return GU.getRows(this.gridId).count();
  }

  // asserts that the grid has a certain number of rows
  expectNumberOfGridRows(number) {
    GU.expectRowCount(
      this.gridId,
      number,
      `Expected Invoice Registry's ui-grid row count to be ${number}.`
    );
  }

  openReceipt(reference) {
    const row = new GridRow(reference);
    row.dropdown().click();
    row.receipt().click();
  }

  openCreditNoteReceipt(reference) {
    const row = new GridRow(reference);
    row.dropdown().click();
    row.openReverseReceipt().click();
  }

  reverse(reference) {
    const row = new GridRow(reference);
    row.dropdown().click();
    row.reverse().click();
  }

  remove(reference) {
    const row = new GridRow(reference);
    row.dropdown().click();
    row.remove().click();
  }
}

module.exports = InvoiceRegistryPage;
