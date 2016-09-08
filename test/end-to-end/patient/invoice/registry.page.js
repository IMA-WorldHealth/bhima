/* jshint expr:true */
/* global element, by, browser */

const FU = require('../../shared/FormUtils');
const GU = require('../../shared/GridUtils');

function InvoiceRegistryPage() {
  const page = this;

  const gridId = 'invoice-registry';

  function getInvoiceNumber() {
    return GU.getRows(gridId).count();
  }

  function showInvoiceProof(n) {
    const receiptColumnNumber = 6;

    const row = GU.getGrid(gridId)
      .$('.ui-grid-render-container-body')
      .element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index').row(n));

    // click the <a> tag within the cell
    row
      .element(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid').row(receiptColumnNumber))
      .element(by.css('[data-method="receipt"]'))
      .click();
  }

  page.getInvoiceNumber = getInvoiceNumber;
  page.showInvoiceProof = showInvoiceProof;
}

module.exports = InvoiceRegistryPage;
