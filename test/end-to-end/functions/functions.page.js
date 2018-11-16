/* eslint class-methods-use-this:off */

const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');

class FunctionPage {
  create(label) {
    FU.buttons.create();

    FU.input('FunctionModalCtrl.function.fonction_txt', label);

    FU.buttons.submit();
  }

  errorOnCreateFunction() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('FunctionModalCtrl.function.fonction_txt');
    FU.buttons.cancel();
  }

  update(oldLabel, newLabel) {
    const row = new GridRow(oldLabel);
    row.dropdown().click();
    row.edit().click();

    FU.input('FunctionModalCtrl.function.fonction_txt', newLabel);

    FU.modal.submit();
  }

  remove(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.remove().click();
    FU.modal.submit();
  }
}

module.exports = FunctionPage;
