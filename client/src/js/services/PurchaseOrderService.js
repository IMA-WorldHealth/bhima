angular.module('bhima.services')
  .service('PurchaseOrderService', PurchaseOrderService);

PurchaseOrderService.$inject = [ '$http', 'util' ];

/**
 * Purchase Order Service
 *
 * Connects client controllers with the purchase order backend.
 *
 * @todo -- there is currently no backend for purchase orders to search by
 * reference.
 */
function PurchaseOrderService($http, util) {
  var service = this;
  var baseUrl = '/purchases/';

  /** @method read */
  service.read = read;


  /**
   * Retrieves a purchase order by UUID or lists all purchases if no UUID is
   * specified.
   *
   * @param {string} uuid (optional) - the uuid of the purchase order to look
   * up in the database.
   * @param {object} options (optional) - options to be passed as query string
   * parameters to the HTTP request
   * @returns {promise} promise - the result of the HTTP request
   */
  function read(uuid, options) {
    var target = baseUrl.concat(uuid || '');
    return $http.get(target, options)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
