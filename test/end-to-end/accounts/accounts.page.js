/* global element, by, browser  */
/* eslint class-methods-use-this:off */
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
    GU.expectRowCountAbove(this.gridId, numRows);
  }

  expectRowVisible(number) {
    FU.exists(by.css(`[data-row="${number}"]`), true);
  }

  expectRowHidden(number) {
    FU.exists(by.css(`[data-row="${number}"]`), false);
  }

  toggleTitleRow(number) {
    this.getTitleRow(number)
      .$('[data-account-title]')
      .click();
  }

  openAddChild(number) {
    this.getTitleRow(number)
      .$('[data-action="add-child"]')
      .click();
  }

  openEdit(number) {
    const row = new GridRow(number);
    row.dropdown().click();
    row.edit().click();
  }

  deleteAccount(number) {
    const row = new GridRow(number);
    row.dropdown().click();
    row.remove().click();
    components.modalAction.confirm();
  }

  openImportMenu() {
    $('[data-action="open-tools"]').click();
    $('[data-action="import-accounts"]').click();
    browser.wait(EC.visibilityOf(element(by.css('[data-import-modal]'))), 3000, 'Could not find import modal.');
  }

  chooseImportOption(option) {
    FU.radio('ImportAccountsCtrl.option', option);
  }

  uploadFile(fileToUpload) {
    const absolutePath = path.resolve(fixtures, fileToUpload);
    element(by.id('import-input')).sendKeys(absolutePath);
  }

  toggleBatchCreate() {
    element(by.model('AccountEditCtrl.batchCreate')).click();
  }
}

module.exports = AccountsPage;
