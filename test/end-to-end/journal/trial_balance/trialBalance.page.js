/* global element, by */

function TrialBalancePage() {
  const page = this;

  const grid = element(by.id('overview-grid'));
  const gridRows = grid
    .element(by.css('.ui-grid-render-container-body'))
    .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));
  const viewErrorButton = $('[data-method="show-error"]');
  const cancelButton = $('[data-method="cancel"]');
  const submitButton = $('[data-method="submit"]');
  const resetButton = $('[data-method="reset"]');

  function submitData() {
    return submitButton.click();
  }

  function closeTrialBalance() {
    return cancelButton.click();
  }

  function getLineCount() {
    return gridRows.count();
  }

  function viewErrorList() {
    return viewErrorButton.click();
  }

  function resetView() {
    return resetButton.click();
  }

  function showAccountDetailInTransaction(n) {
    const columnNumber = 5;

    const row = grid
      .$('.ui-grid-render-container-body')
      .element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index').row(n));

    // click the <a> tag within the cell
    row
      .element(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid').row(columnNumber))
      .element(by.css('[data-method="detail"]'))
      .click();
  }

  page.getLineCount = getLineCount;
  page.submitData = submitData;
  page.closeTrialBalance = closeTrialBalance;
  page.viewErrorList = viewErrorList;
  page.resetView = resetView;
  page.showAccountDetailInTransaction = showAccountDetailInTransaction;
}

module.exports = TrialBalancePage;
