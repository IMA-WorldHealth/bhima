const TU = require('./TestUtils');

/**
 * This class is specifically for dealing with dropdown menus on grid rows in
 * registries.  It is registry agnostic, provided that the registry implements
 * "data-row='${reference}'" on its dropdown menu.
 */
class GridRow {
  constructor(reference) {
    this.reference = reference;
  }

  async dropdown() {
    const menu = await TU.locator(`[data-row="${this.reference}"] [data-action="open-dropdown-menu"]`);
    return menu.click();
  }

  async reverse() {
    const record = await TU.locator(`[data-row-menu="${this.reference}"] [data-method="reverse-record"]`);
    return record.click();
  }

  async remove() {
    const record = await TU.locator(`[data-row-menu="${this.reference}"] [data-method="delete-record"]`);
    return record.click();
  }

  async edit() {
    const record = await TU.locator(`[data-row-menu="${this.reference}"] [data-method="edit-record"]`);
    return record.click();
  }

  async receipt() {
    const record = await TU.locator(`[data-row-menu="${this.reference}"] [data-method="receipt"]`);
    return record.click();
  }

  async method(methodName) {
    const record = await TU.locator(`[data-row-menu="${this.reference}"] [data-method="${methodName}"]`);
    return record.click();
  }

  async goToInvoices() {
    const record = await TU.locator(`[data-row-menu="${this.reference}"] [data-method="view-invoices"]`);
    return record.click();
  }

  async goToTransaction() {
    const record = await TU.locator(`[data-row-menu="${this.reference}"] [data-method="view-transaction"]`);
    return record.click();
  }

  async goToPayment() {
    const record = await TU.locator(`[data-row-menu="${this.reference}"] [data-method="view-payment"]`);
    return record.click();
  }

  async goToPatient() {
    const record = await TU.locator(`[data-row-menu="${this.reference}"] [data-method="view-patient"]`);
    return record.click();
  }

  async openReverseReceipt() {
    const record = await TU.locator(`[data-row-menu="${this.reference}"] [data-method="reverse-receipt"]`);
    return record.click();
  }

  async goToVoucher() {
    const record = await TU.locator(`[data-row-menu="${this.reference}"] [data-method="view-voucher"]`);
    return record.click();
  }

}

module.exports = GridRow;
