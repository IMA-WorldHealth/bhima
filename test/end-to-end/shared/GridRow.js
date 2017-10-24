/**
 * @class GridRow
 *
 * @description
 * This class is specifically for dealing with dropdown menus on grid rows in
 * registries.  It is registry agnostic, provided that the registry implements
 * "data-row='${reference}'" on its dropdown menu.
 */
class GridRow {
  constructor(reference, anchor = $('body')) {
    this.reference = reference;
    this.anchor = anchor;
    this.link = anchor.$(`[data-row="${reference}"]`);
    this.menu = this.anchor.$(`[data-row-menu="${reference}"]`);
  }

  dropdown() {
    return this.link.$('[data-action="open-dropdown-menu"]');
  }

  reverse() {
    return this.menu.$('[data-method="reverse-record"]');
  }

  remove() {
    return this.menu.$('[data-method="delete-record"]');
  }

  receipt() {
    return this.menu.$('[data-method="receipt"]');
  }

  goToInvoice() {
    return this.menu.$('[data-method="view-invoice"]');
  }

  goToTransaction() {
    return this.menu.$('[data-method="view-transaction"]');
  }

  goToPayment() {
    return this.menu.$('[data-method="view-payment"]');
  }

  goToPatient() {
    return this.menu.$('[data-method="view-patient"]');
  }

  openReverseReceipt() {
    return this.menu.$('[data-method="reverse-receipt"]');
  }

  goToVoucher() {
    return this.menu.$('[data-method="view-voucher"]');
  }

}

module.exports = GridRow;
