angular.module('bhima.services')
.service('ReceiptService', ReceiptService);

ReceiptService.$inject = ['$http', 'util' , 'LanguageService'];

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
function ReceiptService($http, util, Language) {
  var service = this;
  var renderers = {
    PDF  : 'pdf',
    HTML : 'html',
    JSON : 'json'
  };

  // expose data
  service.renderers = renderers;

  // expose service methods
  service.invoice = invoice;
  service.patient = patient;
  service.purchase = purchase;
  service.cash = cash;
  service.transaction = transaction;
  service.payroll = payroll;

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
  function fetch(target, options) {
    var responseType = null;

    options = options || {};

    // set the session language
    options.lang = Language.key;

    if (options.renderer === renderers.PDF) {
      responseType = 'arraybuffer';
    }

    return $http.get(target, {params: options, responseType: responseType})
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
    var route = '/reports/invoices/'.concat(uuid);
    return fetch(route, options);
  }

  // print the patient card
  function patient(uuid, options) {
    var route ='/reports/patient/'.concat(uuid);
    return fetch(route, options);
  }

  // print a receipt modal
  function purchase(uuid, options) {
    var route ='/reports/purchases/'.concat(uuid);
    return fetch(route, options);
  }

  // print a cash (point-of-sale) receipt
  function cash(uuid, options) {
    var route = '/reports/cash/'.concat(uuid);
    return fetch(route, options);
  }

  // print a generic transaction receipt
  function transaction(uuid, options) {
    /* noop */
  }

  // print a receipt of payroll payment
  // TBD - is this really necessary to have as a separate receipt?
  function payroll(uuid, options) {
    /* noop */
  }

  return service;
}
