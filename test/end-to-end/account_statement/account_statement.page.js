/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');

function AccountStatementCorePage() {
  const page = this;
  const gridId = 'account-statement-grid';

  function openSearchModal() {
    $('[data-method="search"]').click();
  }

  function tabulate(tabIndex) {
    const index = tabIndex || 0;
    return $(`[index="${index}"]`).click();
  }

  function comment(message) {
    $('[data-method="comment"]').click();
    FU.input('$ctrl.comment', message);
    FU.modal.submit();
  }

  function setAccount(value) {
    return components.accountSelect.set(value);
  }

  function formModalSubmit() {
    FU.modal.submit();
  }

  // expose methods
  page.comment = comment;
  page.openSearchModal = openSearchModal;
  page.tabulate = tabulate;
  page.setAccount = setAccount;
  page.formModalSubmit = formModalSubmit;

  // custom wrappers for GU functionality
  page.selectRow = (number) => GU.selectRow(gridId, number);
  page.expectColumnCount = (number) => GU.expectColumnCount(gridId, number);
  page.expectRowCount = (number) => GU.expectRowCount(gridId, number);
  page.getCell = (row, col) => GU.getCell(gridId, row, col);
  page.cellValueMatch = (row, col, value) => GU.expectCellValueMatch(gridId, row, col, value);
}

module.exports = AccountStatementCorePage;
