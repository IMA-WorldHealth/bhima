const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

const GridRow = require('../shared/GridRow');

const { bhCheckboxTree } = require('../shared/components');

class RolesPage {

  submit() {
    return TU.modal.submit();
  }

  async setLabel(txt) {
    const roleLabel = await TU.locator(by.model('RolesAddCtrl.role.label'));
    return roleLabel.fill(txt);
  }

  async openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown();
    return row;
  }

  async editRole(label) {
    const row = await this.openDropdownMenu(label);
    await row.edit();
  }

  async deleteRole(label) {
    const row = await this.openDropdownMenu(label);
    await row.remove();
  }

  async editPermissions(label) {
    const row = await this.openDropdownMenu(label);
    await row.method('edit-permissions');
  }

  async checkAllPermissions() {
    await TU.waitForSelector(bhCheckboxTree.selector);
    await bhCheckboxTree.toggleAllCheckboxes();
  }

  async assignRole(label) {
    const row = await this.openDropdownMenu(label);
    await row.method('assign_roles');
  }

  async assignActions(label) {
    const row = await this.openDropdownMenu(label);
    await row.method('edit-actions');
  }

  async setRole(txt) {
    await TU.waitForSelector(bhCheckboxTree.selector);
    return bhCheckboxTree.toggle([txt]);
  }

  setAction(label) {
    return TU.locator(`[data-label="${label}"]`).click();
  }

  openCreateModal() {
    return TU.buttons.create();
  }
}

module.exports = RolesPage;
