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
  const service = this;

  const modalConfiguration = {
    templateUrl : '/js/services/receipts/modal/receiptModal.tmpl.html',
    controller  : 'ReceiptModalController as ReceiptCtrl',
    size        : 'lg',
    backdrop    : 'static',
    animation   : false,
  };

  // expose available receipts
  service.invoice = invoice;
  service.patient = patient;
  service.purchase = purchase;
  service.cash = cash;
  service.transaction = transaction;
  service.payroll = payroll;
  service.voucher = voucher;
  service.creditNote = creditNote;
  service.accountSlip = accountSlip;

  /**
   * Invokes a patient invoice receipt
   *
   * @param {String} uuid             Target invoice UUID
   * @param {Boolean} notifyCreated   Defines if a success message should be shown for entity creation
   */
  function invoice(uuid, notifyCreated) {

    /** @todo Discuss if these should be overridable from the controller or if the config should be set here */
    const options = {
      title         : 'PATIENT_INVOICE.PAGE_TITLE',
      createdKey    : 'PATIENT_INVOICE.SUCCESS',
      identifier    : 'reference',
      renderer      : Receipts.renderers.PDF,
      notifyCreated,
    };

    const receiptOptions = {
      renderer : Receipts.renderers.PDF,
      currency : Receipts.receiptCurrency,
    };

    const invoiceRequest = Receipts.invoice(uuid, receiptOptions);
    const invoiceProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise : invoiceRequest }; },
        options : function optionsProvider() { return options; },
      },
    };

    const configuration = angular.extend(modalConfiguration, invoiceProvider);
    const instance = Modal.open(configuration);
    return instance.result;
  }

  /**
   * Invokes a patient card for printing.
   *
   * @param {String} uuid             Target patient UUID
   * @param {Boolean} notifyCreated   Defines if a success message should be shown for entity creation
   */
  function patient(uuid, notifyCreated, userOptions) {

    const options = {
      title         : 'PATIENT_REG.PAGE_TITLE',
      createdKey    : 'PATIENT_REG.SUCCESS',
      identifier    : 'reference',
      renderer      : Receipts.renderers.PDF,
      notifyCreated,
    };

    const receiptOptions = {
      renderer : Receipts.renderers.PDF,
    };

    angular.extend(receiptOptions, userOptions);

    const patientRequest = Receipts.patient(uuid, receiptOptions);
    const patientProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise : patientRequest }; },
        options : function optionsProvider() { return options; },
      },
    };

    const configuration = angular.extend(modalConfiguration, patientProvider);
    const instance = Modal.open(configuration);
    return instance.result;
  }

  /**
   * Invokes a purchase order receipt
   *
   * @param {String} uuid             Target purchase order UUID
   * @param {Boolean} notifyCreated   Defines if a success message should be shown for entity creation
   */
  function purchase(uuid, notifyCreated) {
    const options = {
      title         : 'PURCHASES.PAGE_TITLE',
      createdKey    : 'PURCHASES.RECEIPT.SUCCESS',
      identifier    : 'reference',
      renderer      : Receipts.renderers.PDF,
      notifyCreated,
    };

    const purchaseRequest = Receipts.purchase(uuid, { renderer : options.renderer });
    const reportProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise : purchaseRequest }; },
        options : function optionsProvider() { return options; },
      },
    };

    const configuration = angular.extend(modalConfiguration, reportProvider);
    const instance = Modal.open(configuration);
    return instance.result;
  }

  /**
   * Invokes a cash payment receipt
   *
   * @param {String} uuid             Target cash payment UUID
   * @param {Boolean} notifyCreated   Defines if a success message should be shown for entity creation
   */
  function cash(uuid, notifyCreated) {
    const options = {
      title         : 'CASH.TITLE',
      createdKey    : 'CASH.RECEIPT.SUCCESS',
      identifier    : 'reference', // @todo - what does this do?
      renderer      : Receipts.renderers.PDF,
      notifyCreated,
    };

    const cashRequest = Receipts.cash(uuid, { renderer : options.renderer });
    const reportProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise : cashRequest }; },
        options : function optionsProvider() { return options; },
      },
      keyboard : false,
    };

    const configuration = angular.extend(modalConfiguration, reportProvider);
    const instance = Modal.open(configuration);
    return instance.result;
  }


  /**
   * @method voucher
   *
   * @description
   * Invokes a journal voucher receipt.
   *
   * @param {String} uuid             Target journal voucher UUID
   * @param {Boolean} notifyCreated   Defines if a success message should be shown for entity creation
   */
  function voucher(uuid, notifyCreated) {
    const options = {
      title         : 'VOUCHERS.GLOBAL.TITLE',
      createdKey    : 'VOUCHERS.GLOBAL.RECEIPT.SUCCESS',
      identifier    : 'reference', // @todo - what does this do?
      renderer      : Receipts.renderers.PDF,
      notifyCreated,
    };

    const voucherRequest = Receipts.voucher(uuid, { renderer : options.renderer });
    const reportProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise : voucherRequest }; },
        options : function optionsProvider() { return options; },
      },
    };

    const configuration = angular.extend(modalConfiguration, reportProvider);
    const instance = Modal.open(configuration);
    return instance.result;
  }

  /**
   * Invokes an invoice's credit note
   *
   * @param {String} uuid             Target invoice UUID
   * @param {Boolean} notifyCreated   Defines if a success message should be shown for entity creation
   */
  function creditNote(uuid, notifyCreated, userOptions) {

    /** @todo Discuss if these should be overridable from the controller or if the config should be set here */
    const options = {
      title         : 'TREE.CREDIT_NOTE',
      createdKey    : 'PATIENT_INVOICE.SUCCESS',
      identifier    : 'reference',
      renderer      : Receipts.renderers.PDF,
      notifyCreated,
    };

    const receiptOptions = {
      renderer : Receipts.renderers.PDF,
    };

    angular.extend(receiptOptions, userOptions);

    const creditNoteRequest = Receipts.creditNote(uuid, receiptOptions);
    const creditNoteProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise : creditNoteRequest }; },
        options : function optionsProvider() { return options; },
      },
    };

    const configuration = angular.extend(modalConfiguration, creditNoteProvider);
    const instance = Modal.open(configuration);
    return instance.result;
  }

  /**
   * @method accountSlip
   *
   * @description
   * Invokes a general ledger account slip
   *
   * @param {number} id - Target account ii
   * @param {Boolean} notifyCreated   Defines if a success message should be shown for entity creation
   */
  function accountSlip(id, notifyCreated) {
    const options = {
      title         : 'GENERAL_LEDGER.ACCOUNT_SLIP',
      // createdKey    : 'VOUCHERS.GLOBAL.RECEIPT.SUCCESS',
      // identifier    : 'reference', // @todo - what does this do?
      renderer      : Receipts.renderers.PDF,
      notifyCreated,
    };

    const accountSlipRequest = Receipts.accountSlip(id, { renderer : options.renderer });
    const reportProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise : accountSlipRequest }; },
        options : function optionsProvider() { return options; },
      },
    };

    const configuration = angular.extend(modalConfiguration, reportProvider);
    const instance = Modal.open(configuration);
    return instance.result;
  }

  function transaction(uuid, notifyCreated) {
    /* noop */
  }

  function payroll(periodPayroll, data, notifyCreated) {
    const options = {
      title         : 'TREE.PAYROLL',
      renderer      : Receipts.renderers.PDF,
      notifyCreated,
    };

    const request = {
      idPeriod : periodPayroll,
      employees : data,
    };

    const payrollRequest = Receipts.payroll(request, { renderer : options.renderer });
    const reportProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise : payrollRequest }; },
        options : function optionsProvider() { return options; },
      },
    };

    const configuration = angular.extend(modalConfiguration, reportProvider);
    const instance = Modal.open(configuration);
    return instance.result;
  }

  // ================================ stock =====================================
  // bind methods
  service.stockExitPatientReceipt = stockExitPatientReceipt;
  service.stockExitDepotReceipt = stockExitDepotReceipt;
  service.stockEntryDepotReceipt = stockEntryDepotReceipt;
  service.stockExitServiceReceipt = stockExitServiceReceipt;
  service.stockExitLossReceipt = stockExitLossReceipt;
  service.stockEntryPurchaseReceipt = stockEntryPurchaseReceipt;
  service.stockEntryIntegrationReceipt = stockEntryIntegrationReceipt;
  service.stockEntryDonationReceipt = stockEntryDonationReceipt;
  service.stockAdjustmentReceipt = stockAdjustmentReceipt;

  /**
   * @method stockExitPatientReceipt
   * @param {string} documentUuid
   * @param {boolean} notifyCreated
   */
  function stockExitPatientReceipt(documentUuid, notifyCreated) {
    const opts = { title : 'STOCK.RECEIPT.EXIT_PATIENT', notifyCreated, renderer : Receipts.renderers.PDF };
    const promise = Receipts.stockExitPatientReceipt(documentUuid, { renderer : opts.renderer });
    return ReceiptFactory(promise, opts);
  }

  /**
   * @method stockExitLossReceipt
   * @param {string} documentUuid
   * @param {boolean} notifyCreated
   */
  function stockExitLossReceipt(documentUuid, notifyCreated) {
    const opts = { title : 'STOCK.RECEIPT.EXIT_LOSS', notifyCreated, renderer : Receipts.renderers.PDF };
    const promise = Receipts.stockExitLossReceipt(documentUuid, { renderer : opts.renderer });
    return ReceiptFactory(promise, opts);
  }

  /**
   * @method stockExitServiceReceipt
   * @param {string} documentUuid
   * @param {boolean} notifyCreated
   */
  function stockExitServiceReceipt(documentUuid, notifyCreated) {
    const opts = {
      title : 'STOCK.RECEIPT.EXIT_SERVICE',
      notifyCreated,
      renderer : Receipts.renderers.PDF,
    };
    const promise = Receipts.stockExitServiceReceipt(documentUuid, { renderer : opts.renderer });
    return ReceiptFactory(promise, opts);
  }

  /**
   * @method stockExitDepotReceipt
   * @param {string} documentUuid
   * @param {boolean} notifyCreated
   */
  function stockExitDepotReceipt(documentUuid, notifyCreated) {
    const opts = {
      title : 'STOCK.RECEIPT.EXIT_DEPOT',
      notifyCreated,
      renderer : Receipts.renderers.PDF,
    };

    const promise = Receipts.stockExitDepotReceipt(documentUuid, { renderer : opts.renderer });
    return ReceiptFactory(promise, opts);
  }

  /**
   * @method stockEntryDepotReceipt
   * @param {string} documentUuid
   * @param {boolean} notifyCreated
   */
  function stockEntryDepotReceipt(documentUuid, notifyCreated) {
    const opts = {
      title : 'STOCK.RECEIPT.ENTRY_DEPOT',
      notifyCreated,
      renderer : Receipts.renderers.PDF,
    };

    const promise = Receipts.stockEntryDepotReceipt(documentUuid, { renderer : opts.renderer });
    return ReceiptFactory(promise, opts);
  }

  /**
   * @method stockEntryPurchaseReceipt
   * @param {string} documentUuid
   * @param {boolean} notifyCreated
   */
  function stockEntryPurchaseReceipt(documentUuid, notifyCreated) {
    const opts = {
      title : 'STOCK.RECEIPT.ENTRY_PURCHASE',
      notifyCreated,
      renderer : Receipts.renderers.PDF,
    };

    const promise = Receipts.stockEntryPurchaseReceipt(documentUuid, { renderer : opts.renderer });
    return ReceiptFactory(promise, opts);
  }

  /**
   * @method stockEntryIntegrationReceipt
   * @param {string} documentUuid
   * @param {boolean} notifyCreated
   */
  function stockEntryIntegrationReceipt(documentUuid, notifyCreated) {
    const opts = {
      title : 'STOCK.RECEIPT.ENTRY_INTEGRATION',
      notifyCreated,
      renderer : Receipts.renderers.PDF,
    };

    const promise = Receipts.stockEntryIntegrationReceipt(documentUuid, { renderer : opts.renderer });
    return ReceiptFactory(promise, opts);
  }

  /**
   * @method stockEntryDonationReceipt
   * @param {string} documentUuid
   * @param {boolean} notifyCreated
   */
  function stockEntryDonationReceipt(documentUuid, notifyCreated) {
    const opts = {
      title : 'STOCK.RECEIPT.ENTRY_DONATION',
      notifyCreated,
      renderer : Receipts.renderers.PDF,
    };

    const promise = Receipts.stockEntryDonationReceipt(documentUuid, { renderer : opts.renderer });
    return ReceiptFactory(promise, opts);
  }

  /**
   * @method stockAdjustmentReceipt
   * @param {string} documentUuid
   * @param {boolean} notifyCreated
   */
  function stockAdjustmentReceipt(documentUuid, notifyCreated) {
    const opts = { title : 'STOCK.RECEIPT.ADJUSTMENT', notifyCreated, renderer : Receipts.renderers.PDF };
    const promise = Receipts.stockAdjustmentReceipt(documentUuid, { renderer : opts.renderer });
    return ReceiptFactory(promise, opts);
  }

  /**
   * @method ReceiptFactory
   * @description A factory for receipts
   */
  function ReceiptFactory(promise, options) {
    const defaults = {
      renderer : Receipts.renderers.PDF,
      notifyCreated : false,
    };

    const parameters = angular.extend(defaults, options);
    const provider = {
      resolve :  {
        receipt : function receiptProvider() { return { promise }; },
        options : function optionsProvider() { return parameters; },
      },
    };

    const configuration = angular.extend(modalConfiguration, provider);
    const instance = Modal.open(configuration);
    return instance.result;
  }


  // ================================ end stock =================================

  return service;
}
