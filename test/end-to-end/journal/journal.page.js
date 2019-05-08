/* global by, element */
/* eslint class-methods-use-this:off */

const GU = require('../shared/GridUtils');

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

    return Promise.all(rows
      .map(async (row, index) => {
        const attr = await row.$(`[data-row]`).getAttribute('data-row');
        if (attr === transId) {
          await GU.selectRow(this.gridId, index);
        }
      }));
  }

  async selectTransactions(transIds /* Array */) {
    const rows = await this.grid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));

    return Promise.all(rows
      .map(async (row, index) => {
        const attr = await row.$(`[data-row]`).getAttribute('data-row');
        if (transIds.includes(attr)) {
          await GU.selectRow(this.gridId, index);
        }
      }));
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
