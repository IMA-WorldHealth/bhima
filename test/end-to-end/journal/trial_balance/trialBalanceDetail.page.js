/* global element, by, browser */

function TrialBalanceDetailPage() {
  var page = this;

  const grid = element(by.id('detail-grid'));
  const gridRows = grid.element(by.css('.ui-grid-render-container-body')).all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));
  const resetButton = $('[data-method="reset"]');


  function reset (){
    return resetButton.click();
  }

  function getLineCount() {
    return gridRows.count();
  }

  page.getLineCount = getLineCount;
  page.reset = reset;
}

module.exports = TrialBalanceDetailPage;

