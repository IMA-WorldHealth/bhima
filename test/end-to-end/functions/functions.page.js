/* eslint  */

const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');

class FunctionPage {
  async create(label) {
    await FU.buttons.create();
    await FU.input('FunctionModalCtrl.function.fonction_txt', label);
    await FU.buttons.submit();
  }

  async errorOnCreateFunction() {
    await FU.buttons.create();
    await FU.buttons.submit();
    await FU.validation.error('FunctionModalCtrl.function.fonction_txt');
    await FU.buttons.cancel();
  }

  async update(oldLabel, newLabel) {
    const row = new GridRow(oldLabel);
    await row.dropdown().click();
    await row.edit().click();
    await FU.input('FunctionModalCtrl.function.fonction_txt', newLabel);
    await FU.modal.submit();
  }

  async remove(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.remove().click();
    await FU.modal.submit();
  }
}

module.exports = FunctionPage;
