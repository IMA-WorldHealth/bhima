angular.module('bhima.services')
.service('ReceiptService', ReceiptService);

ReceiptService.$inject = ['$http', 'util'];

/**
 * Receipts Service
 *
 * This service is responsible for interfacing with any receipts routes on the
 * server.
 *
 * @module services/receipts/ReciptService
 */
function ReceiptService($http, util) {
  var service = this;
  var renderers = {
    PDF  : 'pdf',
    HTML : 'html',
    JSON : 'json'
  };

  service.invoice = invoice;
  service.patient = patient;
  service.purchase = purchase;
  service.renderers = renderers;
  /** service.patientRegistrations = patientRegistrations; */

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
}
