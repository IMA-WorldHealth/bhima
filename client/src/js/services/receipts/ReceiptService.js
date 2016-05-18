angular.module('bhima.services')
.service('ReceiptService', ReceiptService);

ReceiptService.$inject = ['$http', 'util'];

/**
 * Receipts Service
 *
 * This service is responsible for interfacing with any receipts routes on the
 * server.
 *
 * @todo  currently this server 1:1 maps with the ReceiptModal service/controller.
 *        This relationship improved or justified with unit tests.
 * @module services/receipts/ReciptService
 */
function ReceiptService($http, util) {
  var service = this;

  service.invoice = invoice;

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
    return $http.get(route, { params : options })
      .then(util.unwrapHttpResponse);
  }
}
