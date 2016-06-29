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
  service.patient = patient;
  service.purchase = purchase;

  /**
   * Invokes a patient invoice receipt
   *
   * @param {String} uuid             Target invoice UUID
   * @param {Boolean} notifyCreated   Defines if a success message should be shown for entity creation
   */
  function invoice(uuid, notifyCreated) {

    /** @todo Discuss if these should be overridable from the controller or if the config should be set here */
    var options = {
      title         : 'PATIENT_INVOICE.PAGE_TITLE',
      createdKey    : 'PATIENT_INVOICE.SUCCESS',
      identifier    : 'reference',
      renderer      : Receipts.renderers.PDF,
      notifyCreated : notifyCreated
    };

    var invoiceRequest = Receipts.invoice(uuid, { renderer : options.renderer });
    var invoiceProvider = {
      resolve : {
        receipt       : function receiptProvider() { return { promise : invoiceRequest }; },
        options       : function optionsProvider() { return options; },
      }
    };

    var configuration = angular.extend(modalConfiguration, invoiceProvider);
    var instance = Modal.open(configuration);
    return instance.result;
  }

  function patient(uuid, notifyCreated) {

    var options = {
      title         : 'PATIENT_REG.PAGE_TITLE',
      createdKey    : 'PATIENT_REG.SUCCESS',
      identifier    : 'reference',
      renderer      : Receipts.renderers.PDF,
      notifyCreated : notifyCreated
    };

    var patientRequest = Receipts.patient(uuid, { renderer : options.renderer });
    var patientProvider = {
      resolve : {
        receipt       : function receiptProvider() { return { promise : patientRequest }; },
        options       : function optionsProvider() { return options; },
      }
    };

    var configuration = angular.extend(modalConfiguration, patientProvider);
    var instance = Modal.open(configuration);
    return instance.result;
  }

  function purchase(uuid, notifyCreated) {
    var options = {
      title         : 'PURCHASES.PAGE_TITLE',
      createdKey    : 'PURCHASES.RECEIPT.SUCCESS',
      identifier    : 'reference',
      renderer      : Receipts.renderers.PDF,
      notifyCreated : notifyCreated
    };

    var purchaseRequest = Receipts.purchase(uuid, { renderer: options.renderer });
    var reportProvider = {
      resolve : {
        receipt       : function receiptProvider() { return { promise : purchaseRequest}; },
        options       : function optionsProvider() { return options; },
      }
    };

    var configuration = angular.extend(modalConfiguration, reportProvider);
    var instance = Modal.open(configuration);
    return instance.result;
  }
}
