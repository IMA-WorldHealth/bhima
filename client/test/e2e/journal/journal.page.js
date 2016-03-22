/* global element, by, beforeEach, inject, broswer */

var GridTestUtils = require('../shared/gridTestUtils.spec.js');

function JournalCorePage() { 
  var page = this;
  
  /** @const */
  var gridId = 'journalGrid';

  var journal = new GridTestUtils.getGrid(gridId);
  
  page.totalRows = totalRows;
  
  // this method is taken from gridTestUtils.spec.js, the standard UI Grid 
  // testing framework (mocha incompatability)
  function totalRows() { 
    var rows = journal.element( by.css('.ui-grid-render-container-body')).all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index') );
    return rows.count();
  }
}
module.exports = JournalCorePage;
