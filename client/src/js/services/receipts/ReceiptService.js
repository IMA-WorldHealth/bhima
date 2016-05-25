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
  service.renderers = renderers;
  
  /**
   * Fetch invoice report data from /reports/invoices/:uuid
   *
   * @param {String} uuid      Target invoice UUID to report on
   * @param {Object} options   Configuration options for the server generated
   *                            report, this includes things like render target.
   * @return {Promise}          Eventually returns report object from server
   */
  function invoice(uuid, options) {
    var route = '/reports/invoices/'.concat(uuid);
    var responseType = null;

    if (options.render === renderers.PDF) {
      responseType = 'arraybuffer';
    }
    return $http.get(route, {params: options, responseType: responseType})
      .then(util.unwrapHttpResponse);
  }
  
  function patient(uuid, options) {
    var route ='/reports/patient/'.concat(uuid);
    var responseType = null;
    
    if (options.render === renderers.PDF) { 
      responseType = 'arraybuffer';
    }
    
    return $http.get(route, {params : options, responseType : responseType})
      .then(util.unwrapHttpResponse);  
  }
}
