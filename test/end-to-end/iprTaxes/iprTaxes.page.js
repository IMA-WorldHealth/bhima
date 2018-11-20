/* global element, by */
/* eslint class-methods-use-this:off */

const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class IprTaxPage {
  constructor() {
    this.gridId = 'ipr-grid';
  }

  count() {
    return element(by.id(this.gridId))
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  create(iprTax) {
    FU.buttons.create();

    FU.input('IprTaxModalCtrl.iprTax.label', iprTax.label);
    FU.input('IprTaxModalCtrl.iprTax.description', iprTax.description);
    components.currencySelect.set(iprTax.currency_id);

    FU.modal.submit();
    components.notification.hasSuccess();
  }

  errorOnCreateIprTax() {
    FU.buttons.create();
    FU.modal.submit();
    FU.validation.error('IprTaxModalCtrl.iprTax.label');
    FU.buttons.cancel();
  }

  update(label, updateIprTax) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.edit().click();

    FU.input('IprTaxModalCtrl.iprTax.label', updateIprTax.label);
    FU.input('IprTaxModalCtrl.iprTax.description', updateIprTax.description);
    components.currencySelect.set(updateIprTax.currency_id);

    FU.modal.submit();
    components.notification.hasSuccess();
  }

  remove(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.remove().click();

    components.modalAction.confirm();
    components.notification.hasSuccess();
  }
}

module.exports = IprTaxPage;
