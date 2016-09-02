/* jshint expr:true */
/* global element, by, browser */

function TrialBalancePage() {
  var page = this;
  
  const grid = element(by.id('transaction-grid'));
  const gridRows = grid.element(by.css('.ui-grid-render-container-body')).all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));
  const viewErrorButton = $('[data-method="show"]');
  const switchViewButton = element(by.id('switchViewID'));
  const cancelButton = element(by.id('cancelID'));
  const submitButton = $('[data-method="submit"]');

  function submitData() {
    return submitButton.click();
  }

  function closeTrialBalance (){
    return cancelButton.click();
  }

  function switchView() {
    return switchViewButton.click();
  }

  function getLineCount() {
    return gridRows.count();
  }

  function openErrorModal() {
    viewErrorButton.click();
  }

  page.getLineCount = getLineCount;
  page.submitData = submitData;
  page.closeTrialBalance = closeTrialBalance;
  page.switchView = switchView;
  page.openErrorModal = openErrorModal;
}

module.exports = TrialBalancePage;
