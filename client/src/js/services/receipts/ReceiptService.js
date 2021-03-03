angular.module('bhima.services')
  .service('ReceiptService', ReceiptService);

ReceiptService.$inject = ['$http', 'util', 'LanguageService', 'AppCache', 'SessionService'];

/**
 * Receipts Service
 *
 * This service is responsible for interfacing with any receipts routes on the
 * server.  It is typically called from the ReceiptModal service.
 *
 * Each of the receipt methods take in:
 *  1. `uuid` - the uuid of the record for which they will return a receipt.
 *  2. `options` - an object of optional parameters to be passed to the HTTP
 *      query.
 *
 * The methods each return a promise with the result from the database.
 *
 * @module services/receipts/ReciptService
 */
function ReceiptService($http, util, Language, AppCache, Session) {
  const service = this;
  const renderers = {
    PDF  : 'pdf',
    HTML : 'html',
    JSON : 'json',
  };

  const cache = new AppCache('receipts');

  service.posReceipt = cache.posReceipt || '0';
  service.simplified = cache.simplified || '0';
  service.invoiceCurrency = cache.invoiceCurrency || Session.enterprise.currency_id;
  service.renderer = cache.renderer || renderers.PDF;

  // expose data
  service.renderers = renderers;

  // expose service methods
  service.invoice = invoice;
  service.patient = patient;
  service.purchase = purchase;
  service.cash = cash;
  service.voucher = voucher;
  service.payroll = payroll;
  service.creditNote = creditNote;

  service.setPosReceipt = setPosReceipt;
  service.setSimplified = setSimplified;
  service.setReceiptCurrency = setReceiptCurrency;
  service.setReceiptRenderer = setReceiptRenderer;
  service.payrollReport = payrollReport;
  service.displayData = displayData;

  /**
   * @method fetch
   *
   * @description
   * Generic fetch method for recovering any data from the server given a target
   * path.
   *
   * @param {String} target    The target URL to send a GET request o
   * @param {Object} options   Configuration options for the server generated
   *                           report, this includes things like renderer target.
   * @returns {Promise}        Eventually returns report object from server
   * @private
   */
  function fetch(target, options = {}) {
    let responseType = null;

    // set the session language
    options.lang = Language.key;

    if (options.renderer === renderers.PDF) {
      responseType = 'arraybuffer';
    }

    return $http.get(target, { params : options, responseType })
      .then(util.unwrapHttpResponse);

  }

  /**
   * Fetch invoice report data from /reports/invoices/:uuid
   *
   * @param {String} uuid      Target invoice UUID to report on
   * @param {Object} options   Configuration options for the server generated
   *                           report, this includes things like renderer target.
   * @return {Promise}         Eventually returns report object from server
   */
  function invoice(uuid, options) {
    options.posReceipt = service.posReceipt;
    const route = '/reports/finance/invoices/'.concat(uuid);
    return fetch(route, options);
  }

  // print the patient card
  function patient(uuid, options) {
    options.posReceipt = service.posReceipt;
    options.simplified = service.simplified;
    const route = '/reports/medical/patients/'.concat(uuid);
    return fetch(route, options);
  }

  // print a receipt modal for a purchase order
  function purchase(uuid, options) {
    const route = '/reports/inventory/purchases/'.concat(uuid);
    return fetch(route, options);
  }

  // print a cash (point-of-sale) receipt
  function cash(uuid, options) {
    options.posReceipt = service.posReceipt;
    const route = '/reports/finance/cash/'.concat(uuid);
    return fetch(route, options);
  }

  // print a complex voucher receipt
  function voucher(uuid, options) {
    options.posReceipt = service.posReceipt;
    const route = '/reports/finance/vouchers/'.concat(uuid);
    return fetch(route, options);
  }

  // print a credit note for an invoice
  function creditNote(uuid, options) {
    const route = '/reports/finance/invoices/'.concat(uuid, '/creditNote');
    return fetch(route, options);
  }

  // print a payslip of payroll payment
  function payroll(request, options) {
    options.employees = request.employees;
    options.idPeriod = request.idPeriod;
    options.currency = request.currency;
    options.payslip = request.payslip;
    options.conversionRate = request.conversionRate;

    // set the session language
    options.lang = Language.key;

    const route = '/reports/payroll/payslip';
    return fetch(route, options);
  }

  // print a payroll Report of payroll payment
  function payrollReport(request, options) {
    options.employees = request.employees;
    options.idPeriod = request.idPeriod;
    options.currency = request.currency;
    options.socialCharge = request.socialCharge;
    options.conversionRate = request.conversionRate;

    // set the session language
    options.lang = Language.key;

    const route = '/reports/payroll/payslip';
    return fetch(route, options);
  }

  // print metadata of survey
  function displayData(request, options) {
    options.uuid = request.dataUuid;
    options.patient = request.patient;
    // set the session language
    options.lang = Language.key;
    const route = '/display_metadata/card';
    return fetch(route, options);
  }

  // ========================== stock ==============================

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
  service.stockAssignReceipt = stockAssignReceipt;
  service.stockRequisitionReceipt = stockRequisitionReceipt;
  service.stockAdjustmentReport = stockAdjustmentReport;
  service.stockAggregateConsumptionReceipt = stockAggregateConsumptionReceipt;

  // stock requisition receipt
  function stockRequisitionReceipt(uuid, options) {
    options.posReceipt = service.posReceipt;
    const route = '/receipts/stock/requisition/'.concat(uuid);
    return fetch(route, options);
  }

  const STOCK_RECEIPT_ROUTE = '/receipts/stock/';
  // helper function to template in route and POS option
  function genericStockReceipt(uuid, options) {
    options.posReceipt = service.posReceipt;
    const route = STOCK_RECEIPT_ROUTE.concat(uuid);
    return fetch(route, options);
  }

  // stock exit patient receipt
  function stockExitPatientReceipt(uuid, options) {
    return genericStockReceipt(uuid, options);
  }

  // stock assign receipt
  function stockAssignReceipt(uuid, options) {
    options.posReceipt = service.posReceipt;
    const route = '/receipts/stock/assign/'.concat(uuid);
    return fetch(route, options);
  }

  // stock exit service receipt
  function stockExitServiceReceipt(uuid, options) {
    return genericStockReceipt(uuid, options);
  }

  // stock exit depot receipt
  function stockExitDepotReceipt(uuid, options) {
    options.is_depot_transfer_exit = 1;
    return genericStockReceipt(uuid, options);
  }

  // stock exit loss receipt
  function stockExitLossReceipt(uuid, options) {
    return genericStockReceipt(uuid, options);
  }

  // stock aggregate consumption
  function stockAggregateConsumptionReceipt(uuid, options) {
    return genericStockReceipt(uuid, options);
  }

  // stock entry depot receipt
  function stockEntryDepotReceipt(uuid, options) {
    options.is_depot_transfer_exit = 0;
    return genericStockReceipt(uuid, options);
  }

  // stock entry purchase receipt
  function stockEntryPurchaseReceipt(uuid, options) {
    return genericStockReceipt(uuid, options);
  }

  // stock entry integration receipt
  function stockEntryIntegrationReceipt(uuid, options) {
    return genericStockReceipt(uuid, options);
  }

  // stock entry donation receipt
  function stockEntryDonationReceipt(uuid, options) {
    return genericStockReceipt(uuid, options);
  }

  // stock adjustment receipt
  function stockAdjustmentReceipt(uuid, options) {
    return genericStockReceipt(uuid, options);
  }

  // render the "articles in stock" report for the stock adjustment
  function stockAdjustmentReport(depotUuid, dateTo, options) {
    const opts = Object.assign(options, {
      depot_uuid : depotUuid,
      dateTo,
      posReceipt : false,
      reportId : 12,
    });
    const route = '/reports/stock/inventories';
    return fetch(route, opts);
  }

  // ========================== end stock ==========================

  function setPosReceipt(posReceiptEnabled) {
    service.posReceipt = posReceiptEnabled;
    cache.posReceipt = posReceiptEnabled;
  }

  function setSimplified(simplifiedEnabled) {
    service.simplified = simplifiedEnabled;
    cache.simplified = simplifiedEnabled;
  }

  function setReceiptRenderer(renderer) {
    cache.renderer = renderer;
    service.renderer = cache.renderer;
  }

  function setReceiptCurrency(currency) {
    service.receiptCurrency = currency;
    cache.receiptCurrency = currency;
  }

  return service;
}
