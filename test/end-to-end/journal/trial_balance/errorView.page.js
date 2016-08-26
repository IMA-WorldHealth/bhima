/* jshint expr:true */
/* global element, by, browser */

function ErrorViewPage() {
  var page = this;

  const grid = element(by.id('error-grid'));
  const gridRows = grid.element(by.css('.ui-grid-render-container-body')).all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));
  const closeButton = $('[data-method="close"]');


  function closeErrorModal (){
    return closeButton.click();
  }

  function getLineCount() {
    return gridRows.count();
  }

  page.getLineCount = getLineCount;
  page.closeErrorModal = closeErrorModal;
}

module.exports = ErrorViewPage;

