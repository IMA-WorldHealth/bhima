angular.module('bhima.services')
  .service('PurchaseOrderService', PurchaseOrderService);

PurchaseOrderService.$inject = [
  'PrototypeApiService', 'SessionService'
];

/**
 * @class PurchaseOrderService
 * @extends PrototypeApiService
 *
 * @description
 * Connects client controllers with the purchase order backend.
 */
function PurchaseOrderService(Api, Session) {
  var service = new Api('/purchases/');

  // bind public methods to the instance
  service.create = create;

  /**
   * @method create
   *
   * @description
   * Preprocesses purchase order data for submission to the server
   */
  function create(data) {

    // loop through the items ensuring that they are properly formatted for
    // inserting into the database.  We only want to send minimal information
    // to the server.
    // Technically, this filtering is also done on the server, but this reduces
    // bandwidth required for the POST request.
    data.items = data.items.map(function (item) {
      delete item._initialised;
      delete item._invalid;
      delete item._valid;
      delete item.code;
      delete item.description;
      delete item.unit;
      return item;
    });

    return Api.create.call(service, data);
  }

  return service;
}
