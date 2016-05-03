/* global element, by, browser */

// var GridTestUtils = require('../shared/gridTestUtils.spec.js');

function JournalCorePage() { 
  var page = this;

  /**
  * journal id, set by default
  *@ todo as it is a journal page, we should provide id dynamicly
  **/

  //journal page component

  var journalShowHideButton = element(by.id('showHideColumnButton'));
  var journalGrid = element(by.id('journalGrid'));
  var descriptionColumnCheckBox = element(by.css('[data-journal-column-option="description"]'));
  var submitButton = element(by.id('submit-config'));
  var resetButton = element(by.id('reset-config'));
  var journalGridRows = journalGrid.element( by.css('.ui-grid-render-container-body')).all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index') );
  var journalGridColumns = journalGrid.element( by.css('.ui-grid-render-container-body')).element( by.css('.ui-grid-header') ).all( by.repeater('col in colContainer.renderedColumns track by col.uid') );

  // this method is taken from gridTestUtils.spec.js, the standard UI Grid 
  // testing framework (mocha incompatability)
  function getTotalRows() { 
    return journalGridRows.count();
  }

  function getColumnCount( expectedNumCols ) {    
    return journalGridColumns.count();
  }

  function showColumnConfigDialog (){
    journalShowHideButton.click();
  }

  function changeDescriptionState(){
    descriptionColumnCheckBox.click();
  }

  function submitConfig (){
    submitButton.click();
  }

  function resetColumnConfig() {
    resetButton.click();
  }

  //expose methods

  page.getTotalRows = getTotalRows;
  page.showColumnConfigDialog = showColumnConfigDialog;
  page.changeDescriptionState = changeDescriptionState;
  page.submitButton = submitConfig; 
  page.getColumnCount = getColumnCount;
  page.resetColumnConfig = resetColumnConfig;
  
}
module.exports = JournalCorePage;
