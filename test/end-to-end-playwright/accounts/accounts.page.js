const path = require('path');

const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

const GU = require('../shared/GridUtils');
const components = require('../shared/components');
const GridRow = require('../shared/GridRow');

const fixtures = path.resolve(__dirname, '../../fixtures/');

class AccountsPage {
  constructor() {
    this.gridId = 'account-grid';

    this.EditModal = {
      parent : () => TU.locator(by.model('AccountEditCtrl.account.parent')).innerText(),
    };
  }

  getGrid() {
    return TU.locator(by.id(this.gridId));
  }

  getRows() {
    return GU.getRows(this.gridId);
  }

  getTitleRow(number) {
    return this.getGrid().locator(`[data-title-row="${number}"]`);
  }

  expectGridRowsAtLeast(numRows) {
    return GU.expectRowCountAbove(this.gridId, numRows);
  }

  expectRowVisible(number) {
    return TU.exists(`[data-row="${number}"]`, true);
  }

  expectRowHidden(number) {
    return TU.exists(`[data-row="${number}"]`, false);
  }

  toggleTitleRow(number) {
    return this.getTitleRow(number)
      .locator('[data-account-title]')
      .click();
  }

  openAddChild(number) {
    return this.getTitleRow(number)
      .locator('[data-action="add-child"]')
      .click();
  }

  async openEdit(number) {
    const row = new GridRow(number);
    await row.dropdown();
    return row.edit();
  }

  async deleteAccount(number) {
    const row = new GridRow(number);
    await row.dropdown();
    await row.remove();
    return components.modalAction.confirm();
  }

  async openImportMenu() {
    await TU.locator('[data-action="open-tools"]').click();
    await TU.locator('[data-action="import-accounts"]').click();
    return TU.waitForSelector('[data-import-modal]');
  }

  chooseImportOption(option) {
    return TU.radio('ImportAccountsCtrl.option', option);
  }

  uploadFile(fileToUpload) {
    const absolutePath = path.resolve(fixtures, fileToUpload);
    return TU.locator(by.id('import-input')).setInputFiles(absolutePath);
  }

  toggleBatchCreate() {
    return TU.locator(by.model('AccountEditCtrl.batchCreate')).click();
  }
}

module.exports = AccountsPage;
