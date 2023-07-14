const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

const GridRow = require('../shared/GridRow');
const { notification } = require('../shared/components');

class AccountReferenceTypePage {
  constructor() {
    this.gridId = 'account-reference-type-grid';

  }

  async init() {
    this.modal = await TU.locator('[uib-modal-window]');
  }

  async count() {
    const rows = await TU.locator(by.id(this.gridId))
      .locator(by.css('.ui-grid-render-container-body'))
      .locator(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .all();
    return rows.length;

    // return TU.locator(by.id(this.gridId))
    //   .locator(by.css('.ui-grid-render-container-body'))
    //   .locator(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
    //   .count();
  }

  async create(accountReferenceType) {
    await TU.buttons.create();
    await TU.input('AccountReferenceTypeModalCtrl.types.label', accountReferenceType.label, this.modal);
    await TU.modal.submit();
    await notification.hasSuccess();
  }

  async errorOnCreateAccountReferenceType() {
    await TU.buttons.create();
    await TU.modal.submit();
    await TU.validation.error('AccountReferenceTypeModalCtrl.types.label', this.modal);
    await TU.modal.cancel();
  }

  async update(code, newAccountReferenceType) {
    const row = new GridRow(code);

    await row.dropdown();
    await row.edit();
    await TU.input('AccountReferenceTypeModalCtrl.types.label', newAccountReferenceType.label, this.modal);

    await TU.modal.submit();
    await notification.hasSuccess();
  }

  async remove(code) {
    const row = new GridRow(code);
    await row.dropdown();
    await row.remove();

    await TU.modal.submit();
    await notification.hasSuccess();
  }
}

module.exports = AccountReferenceTypePage;
