/* global element, by  */

const chai = require('chai');
const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');

helpers.configure(chai);

const GU = require('../shared/GridUtils.js');

function AccountsPage() {
  const page = this;
  const gridId = 'account-grid';

  const getRow = (id) => $(`[data-row="${id}"]`);

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
    element(by.id(`account-edit-${accountId}`)).click();
  };

  page.EditModal = {
    parent : () =>
      element(by.model('AccountEditCtrl.account.parent')).getText(),
  };

  page.toggleBatchCreate = function toggleBatchCreate() {
    element(by.model('AccountEditCtrl.batchCreate')).click();
  };
}

module.exports = AccountsPage;
