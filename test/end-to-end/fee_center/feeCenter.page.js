/* jshint expr:true */
/* global element, by, browser */

/**
 * This class is represents a fee center  page in term of structure and
 * behaviour so it is a fee center page object
 **/

function FeeCenterPage() {
  'use strict';

  const page = this;

  var feeCenterGrid = element(by.id('feeCenterListGrid'));
  var addFeeCenterButon = element(by.css('[data-method="create"]'));

  /** send back the number of fee center in the grid**/
  function getFeeCenterCount() {
    return feeCenterGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the add fee center button click to show the dialog of creation
   **/
  function createFeeCenter () {
    return addFeeCenterButon.click();
  }

  /**
   * simulate a click to a link tailed to the fee center
   *  listed in the grid to show the dialog for editing
   **/
  function editFeeCenter(n) {
    const editLinkColumn = 5; //column indexing begin with 0

    const row = feeCenterGrid
      .$('.ui-grid-render-container-body')
      .element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index')
        .row(n));

    row
      .element(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid')
      .row(editLinkColumn))
      .element(by.id('edit-link'))
      .click();
  }

  /**
   * simulte a link clicking on the grid to show assignation dialog
   * for auxillary fee center
   **/
  // function assignFeeCenter(n) {
  //
  //   const assignFeeCenterLinkColumn = 3;
  //
  //   const row = feeCenterGrid
  //     .$('.ui-grid-render-container-body')
  //     .element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index')
  //     .row(n));
  //
  //   row
  //     .element(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid')
  //     .row(assignFeeCenterLinkColumn))
  //     .element(by.css('[data-method="permission"]'))
  //     .click();
  // }

  page.getFeeCenterCount = getFeeCenterCount;
  page.createFeeCenter = createFeeCenter;
  page.editFeeCenter = editFeeCenter;
  // page.assignFeeCenter = assignFeeCenter;
}

module.exports = FeeCenterPage;
