/* global element, by, browser */
const EC = require('protractor').ExpectedConditions;
const FU = require('../shared/FormUtils');
const GridRow = require('../shared/GridRow');

const { bhCheckboxTree } = require('../shared/components');

class DonorPage {
  constructor() {
    this.gridId = 'donor-grid';
    this.donorName = element(by.model('DonorAddCtrl.donor.display_name'));
    this.donorPhone = element(by.model('DonorAddCtrl.donor.phone'));
    this.donorEmail = element(by.model('DonorAddCtrl.donor.email'));
    this.donorAddress = element(by.model('DonorAddCtrl.donor.address'));
  }

  submit() {
    return FU.modal.submit();
  }

  setName(txt) {
    return this.donorName.clear().sendKeys(txt);
  }

  setPhone(txt) {
    return this.donorPhone.clear().sendKeys(txt);
  }

  setEmail(txt) {
    return this.donorEmail.clear().sendKeys(txt);
  }

  setAddress(txt) {
    return this.donorAddress.clear().sendKeys(txt);
  }

  async openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }

  async editDonor(displayName) {
    const row = await this.openDropdownMenu(displayName);
    await row.edit().click();
  }

  async deleteDonor(displayName) {
    const row = await this.openDropdownMenu(displayName);
    await row.remove().click();
  }

  async checkAllPermissions() {
    await browser.wait(EC.presenceOf($(bhCheckboxTree.selector)), 1500);
    await bhCheckboxTree.toggleAllCheckboxes();
  }

  openCreateModal() {
    return FU.buttons.create();
  }
}

module.exports = DonorPage;
