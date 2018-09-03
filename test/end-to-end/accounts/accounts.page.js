/* global element, by  */
const path = require('path');
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils.js');
const components = require('../shared/components');

function AccountsPage() {
  const page = this;
  const gridId = 'account-grid';
  const fixtures = path.resolve(__dirname, '../../fixtures/');

  const getRow = (id) => $(`[data-row="${id}"]`);
  const openMenu = id => {
    const cell = $(`[data-action="${id}"]`);
    cell.$(`[data-action="open-dropdown-menu"]`).click();
  };

  page.expectGridRowsAtLeast = function expectGridRowsAtLeast(numRows) {
    GU.expectRowCountAbove(gridId, numRows);
  };

  page.expectRowVisible = function isVisible(id) {
    FU.exists(by.css(`[data-row="${id}"]`), true);
  };

  page.expectRowHidden = function isHidden(id) {
    FU.exists(by.css(`[data-row="${id}"]`), false);
  };

  page.toggleTitleRow = function toggleTitleRow(accountId) {
    getRow(accountId).$('[data-account-title]').click();
  };

  page.openAddChild = function openAddChild(accountId) {
    getRow(accountId).$('[data-action="add-child"]').click();
  };

  page.openEdit = function openEdit(accountId) {
    // open the menu
    openMenu(accountId);

    // click the right thing
    const menu = $(`[data-row-menu="${accountId}"`);
    menu.$(`[data-method="edit"]`).click();
  };

  page.openImportMenu = () => {
    element(by.css('[data-action="open-tools"]')).click();
    element(by.css('[data-action="import-accounts"]')).click();
  };

  page.chooseImportOption = option => {
    FU.radio('ImportAccountsCtrl.option', option);
  };

  page.uploadFile = fileToUpload => {
    const absolutePath = path.resolve(fixtures, fileToUpload);
    element.all(by.css('input[type=file]')).get(0).sendKeys(absolutePath);
  };

  page.EditModal = {
    parent : () =>
      element(by.model('AccountEditCtrl.account.parent')).getText(),
  };

  page.toggleBatchCreate = function toggleBatchCreate() {
    element(by.model('AccountEditCtrl.batchCreate')).click();
  };

  page.deleteAccount = function deleteAccount(accountId) {
    // open the menu
    openMenu(accountId);

    // click the right thing
    const menu = $(`[data-row-menu="${accountId}"`);
    menu.$(`[data-method="delete"]`).click();

    components.modalAction.confirm();
  };
}

module.exports = AccountsPage;
