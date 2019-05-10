/* global element, by */
/* eslint  */

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

  async create(iprTax) {
    await FU.buttons.create();

    await FU.input('IprTaxModalCtrl.iprTax.label', iprTax.label);
    await FU.input('IprTaxModalCtrl.iprTax.description', iprTax.description);
    await components.currencySelect.set(iprTax.currency_id);

    await FU.modal.submit();
    await components.notification.hasSuccess();
  }

  async errorOnCreateIprTax() {
    await FU.buttons.create();
    await FU.modal.submit();
    await FU.validation.error('IprTaxModalCtrl.iprTax.label');
    await FU.buttons.cancel();
  }

  async update(label, updateIprTax) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.edit().click();

    await FU.input('IprTaxModalCtrl.iprTax.label', updateIprTax.label);
    await FU.input('IprTaxModalCtrl.iprTax.description', updateIprTax.description);
    await components.currencySelect.set(updateIprTax.currency_id);

    await FU.modal.submit();
    await components.notification.hasSuccess();
  }

  async remove(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.remove().click();

    await components.modalAction.confirm();
    await components.notification.hasSuccess();
  }
}

module.exports = IprTaxPage;
