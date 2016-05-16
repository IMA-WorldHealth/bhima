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

  var modalConfiguration = {
    templateUrl : '/js/services/receipts/modal/receiptModal.tmpl.html',
    controller  : 'ReceiptModalController as ReceiptCtrl',
    size        : 'md',
    backdrop    : 'static',
    animation   : false
  };

  // expose available receipts
  service.invoice = invoice;

  function invoice(uuid) {

    /** @todo Discuss if these should be overridable from the controller or if the config should be set here */
    var options = {
      title       : 'PATIENT_INVOICE.PAGE_TITLE',
      identifier  : 'reference',
      renderer    : 'html',
      template    : 'partials/patient_invoice/receipt/invoice.receipt.tmpl.html',
    };

    var invoiceRequest = Receipts.invoice(uuid, { render : options.renderer });
    var invoiceProvider = {
      resolve : {
        receipt       : function receiptProvider() { return { promise : invoiceRequest }; },
        options       : function templateProvider() { return options; },
      }
    };

    var configuration = angular.extend(modalConfiguration, invoiceProvider);
    var instance = Modal.open(configuration);
    return instance.result;
  }
}
