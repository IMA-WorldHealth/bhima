const TU = require('../../shared/TestUtils');
const { by } = require('../../shared/TestUtils');

const components = require('../../shared/components');
const GridRow = require('../../shared/GridRow');

class WardPage {
  constructor() {
    this.gridId = 'ward-grid';
  }

  submit() {
    return TU.modal.submit();
  }

  selectService(name) {
    return components.serviceSelect.set(name);
  }

  setName(txt) {
    const WardName = TU.locator(by.model('ModalCtrl.ward.name'));
    return WardName.fill(txt);
  }

  setDescription(txt) {
    const WardDescription = TU.locator(by.model('ModalCtrl.ward.description'));
    return WardDescription.fill(txt);
  }

  async openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown();
    return row;
  }

  async editWard(label) {
    const row = await this.openDropdownMenu(label);
    await row.edit();
  }

  async deleteWard(label) {
    const row = await this.openDropdownMenu(label);
    await row.remove();
  }

  openCreateModal() {
    return TU.locator('[data-create-ward]').click();
  }
}

module.exports = WardPage;
