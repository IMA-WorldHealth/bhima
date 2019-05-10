/* eslint  */
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');

class AccountStatementCorePage {
  constructor() {
    const gridId = 'account-statement-grid';
    this.gridId = gridId;

    // custom wrappers for GU functionality
    this.selectRow = (number) => GU.selectRow(gridId, number);
    this.expectColumnCount = (number) => GU.expectColumnCount(gridId, number);
    this.expectRowCount = (number) => GU.expectRowCount(gridId, number);
    this.getCell = (row, col) => GU.getCell(gridId, row, col);
    this.cellValueMatch = (row, col, value) => GU.expectCellValueMatch(gridId, row, col, value);
  }

  openSearchModal() {
    return $('[data-method="search"]').click();
  }

  tabulate(tabIndex) {
    const index = tabIndex || 0;
    return $(`[index="${index}"]`).click();
  }

  async comment(message) {
    await $('[data-method="comment"]').click();
    await FU.input('$ctrl.comment', message);
    await FU.modal.submit();
  }

  setAccount(value) {
    return components.accountSelect.set(value);
  }

  formModalSubmit() {
    return FU.modal.submit();
  }
}

module.exports = AccountStatementCorePage;
