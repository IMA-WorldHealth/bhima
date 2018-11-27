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
  selectTransaction(transId /* text */) {
    this.grid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .each((row, index) => {
        row.$(`[data-row]`).getAttribute('data-row')
          .then(attr => {
            if (attr === transId) {
              GU.selectRow(this.gridId, index);
            }
          });
      });
  }

  selectTransactions(transIds /* Array */) {
    this.grid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .each((row, index) => {
        row.$(`[data-row]`).getAttribute('data-row')
          .then(attr => {
            if (transIds.includes(attr)) {
              GU.selectRow(this.gridId, index);
            }
          });
      });
  }

  openGridConfigurationModal() {
    // open the dropdown menu
    $('[data-action="open-tools"]').click();

    // get the action and click it
    $('[data-method="configure"]').click();
  }

  openTrialBalanceModal() {
    $('[data-method="trial-balance"]').click();
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
