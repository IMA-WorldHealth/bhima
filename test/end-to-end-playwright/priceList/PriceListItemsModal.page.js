const path = require('path');

const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

const fixtures = path.resolve(__dirname, '../../fixtures/');

class PriceListItemsModalPage {
  constructor() {
    this.gridId = 'pricelist-items-grid';
  }

  async setLabel(label) {
    const modal = await TU.locator('.modal-body');
    return TU.input('ModalCtrl.data.label', label, modal);
  }

  async setValue(value) {
    const modal = await TU.locator('.modal-body');
    return TU.input('ModalCtrl.data.value', value, modal);
  }

  uploadFile(fileToUpload) {
    const absolutePath = path.resolve(fixtures, fileToUpload);
    return TU.uploadFile(absolutePath, by.id('import-input'));
  }

  // @TODO: clean this up - migrate this to bhYesNo
  async setIsPercentage(bool) {
    const modal = await TU.locator('.modal-body');
    if (bool) {
      return modal.locator(by.model('ModalCtrl.data.is_percentage')).click();
    }
    return false;
  }

  async setInventory(item) {
    const modal = await TU.locator('.modal-body');
    return TU.uiSelect('ModalCtrl.data.inventory_uuid', item, modal);
  }

  remove(label) {
    return TU.locator(by.id(this.gridId))
      .locator(`[data-row="${label}"]`)
      .locator('[data-method="remove-item"]')
      .click();
  }

  submit() {
    return TU.modal.submit();
  }

  close() {
    return TU.modal.cancel();
  }

  confirm() {
    return TU.locator('form[name="ConfirmModalForm"] [data-method="submit"]').click();
  }

}

module.exports = PriceListItemsModalPage;
