
function InvoiceRegistryPage() {
  var page = this;

  //journal page component
  var searchButton = element(by.id('filterButton'));
  var grid = element(by.id('invoice-registry'));
  var gridRows = grid.element( by.css('.ui-grid-render-container-body')).all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));
  var gridColumns = grid.element( by.css('.ui-grid-render-container-body')).element( by.css('.ui-grid-header') ).all( by.repeater('col in colContainer.renderedColumns track by col.uid') );
  var invoiceProofReference = element(by.id('receipt-confirm-created'));

  function getInvoiceNumber() {
    return gridRows.count();
  }

    function showFilterDialog(){
        searchButton.click();
    }

  function showInvoiceProof(line) {
      var row = grid.element( by.css('.ui-grid-render-container-body')).element( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index').row( line ) );
      row.element( by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid').row( 6 )).click();
  }

  function isInvoiceProofPresent() {
    return invoiceProofReference.isPresent();
  }

  page.getInvoiceNumber = getInvoiceNumber;
  page.showFilterDialog = showFilterDialog;
  page.showInvoiceProof = showInvoiceProof;
  page.isInvoiceProofPresent = isInvoiceProofPresent;
}
module.exports = InvoiceRegistryPage;
