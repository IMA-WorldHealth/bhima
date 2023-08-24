const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

const GU = require('../shared/GridUtils');

class JournalPage {
  constructor() {
    this.gridId = 'journal-grid';
  }

  count() {
    return GU.getRows(this.gridId).count();
  }

  // select a transaction
  async selectTransaction(transId /* text */) {
    const grid = TU.locator(by.id(this.gridId));
    const rows = await grid
      .locator('.ui-grid-render-container-body')
      .locator(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .all();

    await TU.series(rows, async (row, index) => {
      const attr = await row.locator(`[data-rowcol]`).getAttribute('data-rowcol');
      if (attr === transId) {
        await GU.selectRow(this.gridId, index);
      }
    });

    return true;
  }

  async selectTransactions(transIds /* Array */) {
    const grid = TU.locator(by.id(this.gridId));
    const rows = await grid
      .locator('.ui-grid-render-container-body')
      .locator(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .all();

    await TU.series(rows, async (row, index) => {
      const attr = await row.locator(`[data-rowcol]`).getAttribute('data-rowcol');
      if (transIds.includes(attr)) {
        await GU.selectRow(this.gridId, index);
      }
    });

    return true;
  }

  async openGridConfigurationModal() {
    // open the dropdown menu
    await TU.locator('[data-action="open-tools"]').click();

    // get the action and click it
    return TU.locator('[data-method="configure"]').click();
  }

  async openTrialBalanceModal() {
    return TU.locator('[data-method="trial-balance"]').click();
  }

  expectHeaderColumns(array) {
    return GU.expectHeaderColumnsContained(this.gridId, array);
  }

  async expectRowCount(num) {
    return GU.expectRowCount(this.gridId, num);
  }

  async expectRowCountAbove(num) {
    return GU.expectRowCountAbove(this.gridId, num);
  }

  async expectColumnCount(number) {
    return GU.expectColumnCount(this.gridId, number);
  }
}

module.exports = JournalPage;
