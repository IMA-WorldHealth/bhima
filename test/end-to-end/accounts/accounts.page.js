/* global element, by, browser  */
/* eslint  */
const path = require('path');
const EC = require('protractor').ExpectedConditions;
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils.js');
const components = require('../shared/components');
const GridRow = require('../shared/GridRow');

const fixtures = path.resolve(__dirname, '../../fixtures/');

class AccountsPage {
  constructor() {
    this.gridId = 'account-grid';

    this.EditModal = {
      parent : () => element(by.model('AccountEditCtrl.account.parent')).getText(),
    };
  }

  getGrid() {
    return element(by.id(this.gridId));
  }

  getTitleRow(number) {
    return this.getGrid().$(`[data-title-row="${number}"]`);
  }

  expectGridRowsAtLeast(numRows) {
    return GU.expectRowCountAbove(this.gridId, numRows);
  }

  expectRowVisible(number) {
    return FU.exists(by.css(`[data-row="${number}"]`), true);
  }

  expectRowHidden(number) {
    return FU.exists(by.css(`[data-row="${number}"]`), false);
  }

  toggleTitleRow(number) {
    return this.getTitleRow(number)
      .$('[data-account-title]')
      .click();
  }

  openAddChild(number) {
    return this.getTitleRow(number)
      .$('[data-action="add-child"]')
      .click();
  }

  async openEdit(number) {
    const row = new GridRow(number);
    await row.dropdown().click();
    await row.edit().click();
  }

  async deleteAccount(number) {
    const row = new GridRow(number);
    await row.dropdown().click();
    await row.remove().click();
    await components.modalAction.confirm();
  }

  async openImportMenu() {
    await $('[data-action="open-tools"]').click();
    await $('[data-action="import-accounts"]').click();
    await browser.wait(EC.visibilityOf(element(by.css('[data-import-modal]'))), 3000, 'Could not find import modal.');
  }

  chooseImportOption(option) {
    return FU.radio('ImportAccountsCtrl.option', option);
  }

  uploadFile(fileToUpload) {
    const absolutePath = path.resolve(fixtures, fileToUpload);
    return element(by.id('import-input')).sendKeys(absolutePath);
  }

  toggleBatchCreate() {
    return element(by.model('AccountEditCtrl.batchCreate')).click();
  }
}

module.exports = AccountsPage;
