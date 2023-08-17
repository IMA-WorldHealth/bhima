const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

const GridRow = require('../shared/GridRow');
const components = require('../shared/components');

class IprTaxPage {
  constructor() {
    this.gridId = 'ipr-grid';
  }

  async count() {
    const rows = await TU.locator(by.id(this.gridId))
      .locator('.ui-grid-render-container-body')
      .locator(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));
    return rows.count();
  }

  async create(iprTax) {
    await TU.buttons.create();

    await TU.input('IprTaxModalCtrl.iprTax.label', iprTax.label);
    await TU.input('IprTaxModalCtrl.iprTax.description', iprTax.description);
    await components.currencySelect.set(iprTax.currency_id);

    await TU.modal.submit();
    await components.notification.hasSuccess();
  }

  async errorOnCreateIprTax() {
    await TU.buttons.create();
    await TU.modal.submit();
    await TU.validation.error('IprTaxModalCtrl.iprTax.label');
    await TU.buttons.cancel();
  }

  async update(label, updateIprTax) {
    const row = new GridRow(label);
    await row.dropdown();
    await row.edit();

    await TU.input('IprTaxModalCtrl.iprTax.label', updateIprTax.label);
    await TU.input('IprTaxModalCtrl.iprTax.description', updateIprTax.description);
    await components.currencySelect.set(updateIprTax.currency_id);

    await TU.modal.submit();
    await components.notification.hasSuccess();
  }

  async remove(label) {
    const row = new GridRow(label);
    await row.dropdown();
    await row.remove();

    await components.modalAction.confirm();
    await components.notification.hasSuccess();
  }
}

module.exports = IprTaxPage;
