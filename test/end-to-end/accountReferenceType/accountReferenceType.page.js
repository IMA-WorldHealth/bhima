/* global element, by */
/* eslint  */

const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const { notification } = require('../shared/components');

class AccountReferenceTypePage {
  constructor() {
    this.gridId = 'account-reference-type-grid';
    this.modal = $('[uib-modal-window]');
  }

  count() {
    return element(by.id(this.gridId))
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  async create(accountReferenceType) {
    await FU.buttons.create();
    await FU.input('AccountReferenceTypeModalCtrl.types.label', accountReferenceType.label, this.modal);
    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async errorOnCreateAccountReferenceType() {
    await FU.buttons.create();
    await FU.modal.submit();
    await FU.validation.error('AccountReferenceTypeModalCtrl.types.label', this.modal);
    await FU.modal.cancel();
  }

  async update(code, newAccountReferenceType) {
    const row = new GridRow(code);

    await row.dropdown().click();
    await row.edit().click();
    await FU.input('AccountReferenceTypeModalCtrl.types.label', newAccountReferenceType.label, this.modal);

    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async remove(code) {
    const row = new GridRow(code);
    await row.dropdown().click();
    await row.remove().click();

    await FU.modal.submit();
    await notification.hasSuccess();
  }
}

module.exports = AccountReferenceTypePage;
