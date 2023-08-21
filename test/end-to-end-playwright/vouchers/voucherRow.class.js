const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');
const GU = require('../shared/GridUtils');

/**
 * Models a single row on the Complex Journal Voucher Grid.  This should ease the
 * creation of end to end tests.
 */
class VoucherRow {
  constructor(index) {
    this.index = index;
  }

  // account setter
  async account(number) {
    const val = typeof number === 'number' ? number.toString() : number;
    const node = await GU.getRow('voucherGridId', this.index);
    const field = await node.locator('[account-id="row.entity.account_id"] input[name="account"]');
    await field.fill(val);
    return field.blur();
  }

  // sets the debit value
  async debit(number) {
    const val = typeof number === 'number' ? number.toString() : number;
    const node = await GU.getRow('voucherGridId', this.index);
    return node.locator(by.model('row.entity.debit')).fill(val);
  }

  // sets the credit value
  async credit(number) {
    const val = typeof number === 'number' ? number.toString() : number;
    const node = await GU.getRow('voucherGridId', this.index);
    return node.locator(by.model('row.entity.credit')).fill(val);
  }

  // sets the entity
  async entity(type, name) {
    const node = await GU.getRow('voucherGridId', this.index);

    // click the 'open entity modal' button
    await node.locator('[data-entity-button]').click();

    // the modal is now open
    const modal = await TU.locator('[uib-modal-window="modal-window"]');

    // select the proper entity type (Debtor/Creditor)
    await modal.locator('[data-dropdown-target="entity"]').click();
    const entity = TU.locator('.modal-dialog [uib-dropdown-menu]').locator(by.linkContainsText(type));
    await entity.click();

    // select the entity
    await TU.input('$ctrl.entity', name);

    // click the 'submit' button
    await TU.modal.submit();
  }

  // sets the reference
  async reference(type, index) {
    const node = await GU.getRow('voucherGridId', this.index);
    // click the 'open reference modal' button
    await node.locator('[data-reference-button]').click();

    // select the type
    await TU.locator(`[data-button-${type}]`).click();

    await GU.selectRow('referenceGrid', index);

    // submit the modal
    await TU.modal.submit();
  }
}

module.exports = VoucherRow;
