angular.module('bhima.services')
  .service('PurchaseOrderService', PurchaseOrderService);

PurchaseOrderService.$inject = [ 'PrototypeApiService' ];

/**
 * @class PurchaseOrderService
 * @extends PrototypeApiService
 *
 * @description
 * Connects client controllers with the purchase order backend.
 */
function PurchaseOrderService(Api) {
  var service = new Api('/purchases/');

  return service;
}
