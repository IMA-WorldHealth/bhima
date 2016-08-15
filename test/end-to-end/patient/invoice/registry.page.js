/* jshint expr:true */
/* global element, by, browser */

const FU = require('../../shared/FormUtils');

function InvoiceRegistryPage() {
  const page = this;

  //
  const grid = element(by.id('invoice-registry'));
  const gridRows = grid
    .element(by.css('.ui-grid-render-container-body'))
    .all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));

  function getInvoiceNumber() {
    return gridRows.count();
  }

  function showInvoiceProof(n) {
    const receiptColumnNumber = 6;

    const row = grid
      .$('.ui-grid-render-container-body')
      .element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index').row(n));

    // click the <a> tag within the cell
    row
      .element(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid').row(receiptColumnNumber))
      .element(by.tagName('a'))
      .click();
  }

  page.getInvoiceNumber = getInvoiceNumber;
  page.showInvoiceProof = showInvoiceProof;
}

module.exports = InvoiceRegistryPage;
