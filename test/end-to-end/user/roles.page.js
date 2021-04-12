/* global element, by, browser */
const EC = require('protractor').ExpectedConditions;
const FU = require('../shared/FormUtils');
const GridRow = require('../shared/GridRow');

const { bhCheckboxTree } = require('../shared/components');

class RolesPage {
  constructor() {
    this.roleLabel = element(by.model('RolesAddCtrl.role.label'));
  }

  submit() {
    return FU.modal.submit();
  }

  setLabel(txt) {
    return this.roleLabel.clear().sendKeys(txt);
  }

  async openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }

  async editRole(label) {
    const row = await this.openDropdownMenu(label);
    await row.edit().click();
  }

  async deleteRole(label) {
    const row = await this.openDropdownMenu(label);
    await row.remove().click();
  }

  async editPermissions(label) {
    const row = await this.openDropdownMenu(label);
    await row.menu.$('[data-method="edit-permissions"]').click();
  }

  async checkAllPermissions() {
    await browser.wait(EC.presenceOf($(bhCheckboxTree.selector)), 1500);
    await bhCheckboxTree.toggleAllCheckboxes();
  }

  async assignRole(label) {
    const row = await this.openDropdownMenu(label);
    await row.menu.$('[data-method="assign_roles"]').click();
  }

  async assignActions(label) {
    const row = await this.openDropdownMenu(label);
    await row.menu.$('[data-method="edit-actions"]').click();
  }

  async setRole(txt) {
    await browser.wait(EC.presenceOf($(bhCheckboxTree.selector)), 1500);
    return bhCheckboxTree.toggle([txt]);
  }

  setAction(label) {
    return $(`[data-label="${label}"]`).click();
  }

  openCreateModal() {
    return FU.buttons.create();
  }
}

module.exports = RolesPage;
