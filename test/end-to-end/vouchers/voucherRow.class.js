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
  async entity(name) {
    const node = await GU.getRow('voucherGridId', this.index);

    // type in the value
    await TU.input('$ctrl.entity', name, node);

    // click the highlighted option in the dropdown
    await TU.locator('.dropdown-menu > [role="option"].active').click();
  }

  // sets the reference
  async reference(name) {
    const node = await GU.getRow('voucherGridId', this.index);

    // fill in the reference on this row
    await TU.input('$ctrl.record', name, node);

    // click the highlighted option in the dropdown
    await TU.locator('.dropdown-menu > [role="option"].active').click();
  }
}

module.exports = VoucherRow;
