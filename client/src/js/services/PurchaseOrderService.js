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
  service.formatFilterParameters = formatFilterParameters;

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

  /**
   * @method formatFilterParameters
   * @description format filters parameters
   */
  function formatFilterParameters(params) {
    var columns = [
      { field: 'is_confirmed', displayName: 'PURCHASES.STATUS.CONFIRMED' },
      { field: 'is_received', displayName: 'PURCHASES.STATUS.RECEIVED' },
      { field: 'is_cancelled', displayName: 'PURCHASES.STATUS.CANCELLED' },
      { field: 'supplier_uuid', displayName: 'FORM.LABELS.SUPPLIER' },
      { field: 'user_id', displayName: 'FORM.LABELS.USER' },
      { field: 'reference', displayName: 'FORM.LABELS.REFERENCE' },
      { field: 'dateFrom', displayName: 'FORM.LABELS.DATE_FROM', comparitor: '>', ngFilter:'date' },
      { field: 'dateTo', displayName: 'FORM.LABELS.DATE_TO', comparitor: '<', ngFilter:'date' },
    ];

    // returns columns from filters
    return columns.filter(function (column) {
      var value = params[column.field];

      if (angular.isDefined(value)) {
        column.value = value;
        return true;
      } else {
        return false;
      }
    });
  }

  return service;
}
