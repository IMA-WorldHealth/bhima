/* global by, element */

const FU = require('../../shared/FormUtils');
const components = require('../../shared/components');
const GridRow = require('../../shared/GridRow');

class WardPage {
  constructor() {
    this.gridId = 'ward-grid';
  }

  submit() {
    return FU.modal.submit();
  }

  selectService(name) {
    return components.serviceSelect.set(name);
  }

  setName(txt) {
    const WardName = element(by.model('ModalCtrl.ward.name'));
    return WardName.clear().sendKeys(txt);
  }

  setDescription(txt) {
    const WardDescription = element(by.model('ModalCtrl.ward.description'));
    return WardDescription.clear().sendKeys(txt);
  }

  async openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }

  async editWard(label) {
    const row = await this.openDropdownMenu(label);
    await row.edit().click();
  }

  async deleteWard(label) {
    const row = await this.openDropdownMenu(label);
    await row.remove().click();
  }

  openCreateModal() {
    return element(by.css('[data-create-ward]')).click();
  }
}

module.exports = WardPage;
