const GU = require('../../shared/GridUtils');
const GridRow = require('../../shared/GridRow');

class InvoiceRegistryPage {
  constructor() {
    this.gridId = 'invoice-registry';
    this.grid = GU.getGrid(this.gridId);
  }

  // asserts that the grid has a certain number of rows
  async expectNumberOfGridRows(number) {
    await GU.expectRowCount(
      this.gridId,
      number,
      `Expected Invoice Registry's ui-grid row count to be ${number}.`,
    );
  }

  async openReceipt(reference) {
    const row = new GridRow(reference);
    await row.dropdown().click();
    await row.receipt().click();
  }

  async openCreditNoteReceipt(reference) {
    const row = new GridRow(reference);
    await row.dropdown().click();
    await row.openReverseReceipt().click();
  }

  async reverse(reference) {
    const row = new GridRow(reference);
    await row.dropdown().click();
    await row.reverse().click();
  }

  async remove(reference) {
    const row = new GridRow(reference);
    await row.dropdown().click();
    await row.remove().click();
  }
}

module.exports = InvoiceRegistryPage;
