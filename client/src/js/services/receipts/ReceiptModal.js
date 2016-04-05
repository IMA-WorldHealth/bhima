angular.module('bhima.services')
.service('ReceiptModal', ReceiptModal);

ReceiptModal.$inject = ['$uibModal', 'ReceiptService'];
  
/** 
 * Receipts Modal Service 
 *
 * This service is responsible for combining receipt service data with the 
 * receipts modal controller and providing a clean interface to be used within 
 * module controllers. 
 *  
 * @todo Discuss how the render target PDF should be templated. Suggestion: 
 *       - IF pdf   - use /src/services/receipts/modal/pdf.tmpl.html
 *       - IF json  - specifiy individual target /partials/patient_invoice/receipt/...
 *
 * @module services/receipts/ReceiptModal
 */
function ReceiptModal(Modal, Receipts) { 
  var service = this;
  
  var receiptController = 'ReceiptModalController as ReceiptCtrl';
  var receiptTemplate   = '/js/services/receipts/modal/receiptModal.tmpl.html';
  var receiptSize       = 'md';
  var receiptBackdrop   = 'static';
  var animateReceipt    = false;

  service.invoice = invoice;

  function invoice(uuid) { 

    /** @todo Discuss if these should be overridable from the controller or if the config should be set here */
    var renderTarget      = 'json';
    var invoiceTemplate   = 'partials/patient_invoice/receipt/invoice.receipt.tmpl.html';
    var invoiceRequest    = Receipts.invoice(uuid, { render : renderTarget });
  
    /** @todo The template passed in should be the /services/modal template which will transclude the invoice template */
    var instance = Modal.open({
      templateUrl : receiptTemplate,
      controller  : receiptController,
      size        : receiptSize,
      backdrop    : receiptBackdrop,
      animation   : animateReceipt,
      resolve     : { 
        receipt       : function receiptProvider() { return { promise : invoiceRequest }; },
        template      : function templateProvider() { return invoiceTemplate; },
        render        : function renderProvider() { return renderTarget; }
      }
    });

    return instance.result;
  }
}
