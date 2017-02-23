/* global element, by, browser */

function generalLedgerPage() {
  var page = this;

  const grid = element(by.id('generalLedger-grid'));
  const gridRows = grid
    .element(by.css('.ui-grid-render-container-body'))
    .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));

  function getLineCount() {
    return gridRows.count();
  }

  page.getLineCount = getLineCount;
}

module.exports = generalLedgerPage;
