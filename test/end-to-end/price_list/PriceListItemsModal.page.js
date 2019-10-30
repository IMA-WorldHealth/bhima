/* global by, element */
const path = require('path');
const FU = require('../shared/FormUtils');

const fixtures = path.resolve(__dirname, '../../fixtures/');

class PriceListItemsModalPage {
  constructor() {
    this.gridId = 'pricelist-items-grid';
    this.modal = $('.modal-body');
    this.buttons = {
      submit : FU.modal.submit,
      close : FU.modal.cancel,
    };
  }

  setLabel(label) {
    return FU.input('ModalCtrl.data.label', label, this.modal);
  }

  setValue(value) {
    return FU.input('ModalCtrl.data.value', value, this.modal);
  }

  uploadFile(fileToUpload) {
    const absolutePath = path.resolve(fixtures, fileToUpload);
    return element(by.id('import-input')).sendKeys(absolutePath);
  }

  // TODO(@jniles) - migrate this to bhYesNo
  async setIsPercentage(bool) {
    if (bool) {
      await this.modal.element(by.model('ModalCtrl.data.is_percentage')).click();
    }
  }

  async setInventory(item) {
    await FU.uiSelect('ModalCtrl.data.inventory_uuid', item, this.modal);
  }

  remove(label) {
    return element(by.id(this.gridId))
      .$(`[data-row="${label}"]`)
      .$('[data-method="remove-item"]')
      .click();
  }

  submit() {
    return this.buttons.submit();
  }

  close() {
    return this.buttons.close();
  }
}

module.exports = PriceListItemsModalPage;
