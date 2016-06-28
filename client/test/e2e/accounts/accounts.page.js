/* global element, by, browser */

'use strict';
const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const GU = require('../shared/gridTestUtils.spec.js');

function AccountsPage() {
  const page = this;

  const gridId = 'account-grid';
  const grid = GU.getGrid(gridId);

  page.getRowCount = getRowCount;

  function getRowCount() {
    var rows = grid.element(by.css('.ui-grid-render-container-body'))
        .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index')).count();
    return rows;
  };

  page.expectGridRows = function expectGridRows(rows) {
    expect(getRowCount()).to.eventually.equal(rows);
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
    parent : function () { return element(by.model('AccountEditCtrl.account.parent')).getAttribute('value'); }
  };

  page.toggleBatchCreate = function toggleBatchCreate() {

    element(by.model('AccountEditCtrl.batchCreate')).click();
  }
}

module.exports = AccountsPage;
