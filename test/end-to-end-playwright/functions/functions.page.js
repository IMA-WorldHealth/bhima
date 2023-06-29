const TU = require('../shared/TestUtils');

const GridRow = require('../shared/GridRow');

class FunctionPage {
  async create(label) {
    await TU.buttons.create();
    await TU.input('FunctionModalCtrl.function.fonction_txt', label);
    await TU.buttons.submit();
  }

  async errorOnCreateFunction() {
    await TU.buttons.create();
    await TU.buttons.submit();
    await TU.validation.error('FunctionModalCtrl.function.fonction_txt');
    await TU.buttons.cancel();
  }

  async update(oldLabel, newLabel) {
    const row = new GridRow(oldLabel);
    await row.dropdown();
    await row.edit();
    await TU.input('FunctionModalCtrl.function.fonction_txt', newLabel);
    await TU.modal.submit();
  }

  async remove(label) {
    const row = new GridRow(label);
    await row.dropdown();
    await row.remove();
    await TU.modal.submit();
  }
}

module.exports = FunctionPage;
