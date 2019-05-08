/* global by, element */
/* eslint class-methods-use-this:off */

const FU = require('../shared/FormUtils');
const GridRow = require('../shared/GridRow');

class RolesPage {
  submit() {
    return FU.modal.submit();
  }

  setLabel(txt) {
    const departmentName = element(by.model('ModalCtrl.department.name'));
    return departmentName.clear().sendKeys(txt);
  }

  async openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }

  async editDepartment(label) {
    const row = await this.openDropdownMenu(label);
    await row.edit().click();
  }

  async deleteDepartment(label) {
    const row = await this.openDropdownMenu(label);
    await row.remove().click();
  }

  openCreateModal() {
    return FU.buttons.create();
  }
}

module.exports = RolesPage;
