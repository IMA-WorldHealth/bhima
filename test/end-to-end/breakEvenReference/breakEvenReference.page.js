/* global element, by */
/* eslint  */

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

  async create(breakEvenReference) {
    await FU.buttons.create();

    await FU.input('BreakEvenReferenceModalCtrl.reference.label', breakEvenReference.label, this.modal);
    await components.accountReferenceSelect.set(breakEvenReference.account_reference_id, 'account_reference_id');
    await element(by.id('is_cost')).click();
    await element(by.id('is_variable')).click();
    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async errorOnCreateBreakEvenReference() {
    await FU.buttons.create();
    await FU.modal.submit();
    await FU.validation.error('BreakEvenReferenceModalCtrl.reference.label', this.modal);
    await FU.modal.cancel();
  }

  async update(code, breakEvenReference) {
    const row = new GridRow(code);
    await row.dropdown().click();
    await row.edit().click();

    await FU.input('BreakEvenReferenceModalCtrl.reference.label', breakEvenReference.label, this.modal);
    await components.accountReferenceSelect.set(breakEvenReference.account_reference_id, 'account_reference_id');
    await element(by.id('is_revenue')).click();
    await element(by.id('is_turnover')).click();
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

module.exports = BreakEvenReferencePage;
