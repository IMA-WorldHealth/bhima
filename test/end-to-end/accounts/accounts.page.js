/* global element, by, browser */

'use strict';
const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const GU = require('../shared/GridUtils.js');

function AccountsPage() {
  const page = this;
  const gridId = 'account-grid';

  page.expectGridRows = function expectGridRows(numRows) {
    GU.expectRowCount(gridId, numRows);
  };

  page.toggleTitleRow = function toggleTitleRow(accountId) {
    element(by.id(`account-title-${accountId}`)).click();
  };

  page.openAddChild = function openAddChild(accountId) {
    element(by.id(`account-add-child-${accountId}`)).click();
  };

  page.openEdit = function openEdit(accountId) {
    element(by.id(`account-edit-${accountId}`)).click();
  };

  page.EditModal = {
    parent : function () {
      return element(by.model('AccountEditCtrl.account.parent')).getText();
    }
  };

  page.toggleBatchCreate = function toggleBatchCreate() {
    element(by.model('AccountEditCtrl.batchCreate')).click();
  };
}

module.exports = AccountsPage;
