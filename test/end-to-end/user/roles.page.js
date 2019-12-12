/* global element, by, browser */
const EC = require('protractor').ExpectedConditions;
const FU = require('../shared/FormUtils');
const GridRow = require('../shared/GridRow');

class RolesPage {
  constructor() {
    this.gridId = 'roles-grid';
    this.roleLabel = element(by.model('RolesAddCtrl.role.label'));
    this.checkAll = element(by.id('checkall'));
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

  async checkAllPerimission() {
    const checkbox = this.checkAll;
    await browser.wait(EC.elementToBeClickable(checkbox), 1500);
    await checkbox.click();
  }

  async assignRole(name) {
    const row = new GridRow(name);
    await row.dropdown().click();
    await row.menu.$('[data-method="assign_roles"]').click();
  }

  async assignActions(label) {
    const row = await this.openDropdownMenu(label);
    await row.menu.$('[data-method="edit-actions"]').click();
  }

  setRole(txt) {
    return $(`[title="${txt}"]`).click();
  }

  setAction(id) {
    return $(`[id="${id}"]`).click();
  }

  openCreateModal() {
    return FU.buttons.create();
  }
}

module.exports = RolesPage;
