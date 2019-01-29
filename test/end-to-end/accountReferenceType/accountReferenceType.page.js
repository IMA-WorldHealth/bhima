/* global element, by */
/* eslint class-methods-use-this:off */

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

  create(accountReferenceType) {
    FU.buttons.create();
    FU.input('AccountReferenceTypeModalCtrl.types.label', accountReferenceType.label, this.modal);
    FU.modal.submit();
    notification.hasSuccess();
  }

  errorOnCreateAccountReferenceType() {
    FU.buttons.create();
    FU.modal.submit();
    FU.validation.error('AccountReferenceTypeModalCtrl.types.label', this.modal);
    FU.modal.cancel();
  }

  update(code, newAccountReferenceType) {
    const row = new GridRow(code);

    row.dropdown().click();
    row.edit().click();
    FU.input('AccountReferenceTypeModalCtrl.types.label', newAccountReferenceType.label, this.modal);

    FU.modal.submit();
    notification.hasSuccess();
  }

  remove(code) {
    const row = new GridRow(code);
    row.dropdown().click();
    row.remove().click();

    FU.modal.submit();
    notification.hasSuccess();
  }
}

module.exports = AccountReferenceTypePage;
