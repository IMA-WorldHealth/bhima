const TU = require('../shared/TestUtils');

const GU = require('../shared/GridUtils');
const components = require('../shared/components');

class AccountStatementCorePage {
  constructor() {
    const gridId = 'account-statement-grid';
    this.gridId = gridId;

    // custom wrappers for GU functionality
    this.selectRow = (rowNum) => GU.selectRow(gridId, rowNum);
    this.expectColumnCount = (number, message) => GU.expectColumnCount(gridId, number, message);
    this.expectRowCount = (number, message) => GU.expectRowCount(gridId, number, message);
    this.getCell = (row, col) => GU.getCell(gridId, row, col);
    this.cellValueMatch = (row, col, value) => GU.expectCellValueMatch(gridId, row, col, value);
    this.getColumnHeaders = () => GU.getColumnHeaders(gridId);
  }

  async openSearchModal() {
    const search = await TU.locator('[data-method="search"]');
    return search.click();
  }

  async setPeriod(periodName) {
    await this.openSearchModal();
    const defaultTab = await TU.locator('ul.nav-tabs li[data-default-filter-tab] > a');
    await defaultTab.click();
    await TU.waitForSelector('[data-bh-period-select] > a');
    const periodSelect = await TU.locator('[data-bh-period-select] > a');
    await periodSelect.click();
    const period = await TU.locator(`[data-bh-period-select] a[data-link="${periodName}"]`);
    await period.click();
    await TU.modal.submit();
    // Wait for the grid to be refilled
    return TU.waitForSelector('[ui-grid-grid-footer]');
  }

  async tabulate(tabIndex) {
    const index = tabIndex || 0;
    const indexTab = await TU.locator(`[index="${index}"]`);
    return indexTab.click();
  }

  async comment(message) {
    await TU.locator('[data-method="comment"]').click();
    await TU.input('$ctrl.comment', message);
    await TU.modal.submit();
  }

  setAccount(value) {
    return components.accountSelect.set(value);
  }

  formModalSubmit() {
    return TU.modal.submit();
  }
}

module.exports = AccountStatementCorePage;
