/* global element, by */
/* eslint class-methods-use-this:off */

const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const { notification } = require('../shared/components');
const components = require('../shared/components');

class BreakEvenReferencePage {
  constructor() {
    this.gridId = 'break-even-reference-grid';
    this.modal = $('[uib-modal-window]');
  }

  count() {
    return element(by.id(this.gridId))
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  create(breakEvenReference) {
    FU.buttons.create();

    FU.input('BreakEvenReferenceModalCtrl.reference.label', breakEvenReference.label, this.modal);
    components.accountReferenceSelect.set(breakEvenReference.account_reference_id, 'account_reference_id');
    element(by.id('is_cost')).click();
    element(by.id('is_variable')).click();
    FU.modal.submit();
    notification.hasSuccess();
  }

  errorOnCreateBreakEvenReference() {
    FU.buttons.create();
    FU.modal.submit();
    FU.validation.error('BreakEvenReferenceModalCtrl.reference.label', this.modal);
    FU.modal.cancel();
  }

  update(code, breakEvenReference) {
    const row = new GridRow(code);
    row.dropdown().click();
    row.edit().click();

    FU.input('BreakEvenReferenceModalCtrl.reference.label', breakEvenReference.label, this.modal);
    components.accountReferenceSelect.set(breakEvenReference.account_reference_id, 'account_reference_id');
    element(by.id('is_revenue')).click();
    element(by.id('is_turnover')).click();
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

module.exports = BreakEvenReferencePage;
