/* global by, element */
/* eslint  */

const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');

class JournalPage {
  constructor() {
    this.gridId = 'journal-grid';
    this.grid = element(by.id(this.gridId));
  }

  count() {
    return GU.getRows(this.gridId).count();
  }

  // select a transaction
  async selectTransaction(transId /* text */) {
    const rows = await this.grid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));

    await FU.series(rows, async (row, index) => {
      const attr = await row.$(`[data-rowcol]`).getAttribute('data-rowcol');
      if (attr === transId) {
        await GU.selectRow(this.gridId, index);
      }
    });

  }

  async selectTransactions(transIds /* Array */) {
    const rows = await this.grid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));

    await FU.series(rows, async (row, index) => {
      const attr = await row.$(`[data-rowcol]`).getAttribute('data-rowcol');
      if (transIds.includes(attr)) {
        await GU.selectRow(this.gridId, index);
      }
    });
  }

  async openGridConfigurationModal() {
    // open the dropdown menu
    await $('[data-action="open-tools"]').click();

    // get the action and click it
    await $('[data-method="configure"]').click();
  }

  async openTrialBalanceModal() {
    await $('[data-method="trial-balance"]').click();
  }

  expectHeaderColumns(array) {
    return GU.expectHeaderColumns(this.gridId, array);
  }

  expectRowCount(num) {
    return GU.expectRowCount(this.gridId, num);
  }

  expectRowCountAbove(num) {
    return GU.expectRowCountAbove(this.gridId, num);
  }

  expectColumnCount(number) {
    return GU.expectColumnCount(this.gridId, number);
  }
}

module.exports = JournalPage;
