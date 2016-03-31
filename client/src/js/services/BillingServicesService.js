angular.module('bhima.services')
.service('BillingServicesService', BillingServicesService);

BillingServicesService.$inject = [
  '$http', 'util'
];

/**
 * Billing Services Service
 *
 * This function wraps the /billing_services API endpoint and exposes CRUD
 * methods to controllers.
 *
 * @constructor
 */
function BillingServicesService($http, util) {
  var service = this;
  var url = '/billing_services/';

  /* service methods */
  service.read = read;
  service.create = create;
  service.update = update;
  service.delete = del;

  /* ------------------------------------------------------------------------ */

  /**
   * The create() method creates a new billing service in the database via a
   * POST requests to the HTTP API endpoint.
   *
   * @param {Object} data - billing service properties to be submitted to the
   *   service.
   * @return {Promise} promise - resolves with the id of the created billing
   *   service entity or is rejected with an HTTP error.
   */
  function create(data) {

    // copy the data not do disrupt the view
    data = angular.copy(data);

    // remove view-specific values
    if (data.account) {
      data.account_id = data.account.id;
      delete data.account;
    }

    return $http.post(url, { billingService : data })
      .then(util.unwrapHttpResponse);
  }

  /**
   * The read() method loads data from the api endpoint. If an id is provided,
   * the $http promise is resolved with a single JSON object, otherwise an array
   * of objects should be expected.
   *
   * @param {Number} id - the id of the billing service (optional).
   * @param {Object} options - options to be passed as query strings (optional).
   * @return {Promise} promise - resolves to either a JSON (if id provided) or
   *   an array of JSONs.
   */
  function read(id, options) {
    var target = url.concat(id || '');
    return $http.get(target, { params : options })
      .then(util.unwrapHttpResponse);
  }

  /**
   * The update() method updates a billing service in the database via a PUT
   * request to the HTTP API endpoint.
   *
   * @param {Number} id - the id of the billing service to be modified.
   * @param {Object} data - billing service properties to be updated with new
   *   values.
   * @return {Promise} promise - resolves with the id of the created billing
   *   service entity or is rejected with an HTTP error.
   */
  function update(id, data) {
    var target = url.concat(id);

    // copy the data not do disrupt the view
    data = angular.copy(data);

    // remove view-specific values
    if (data.account) {
      data.account_id = data.account.id;
      delete data.account;
    }

    // remove unneeded properties
    delete data.updated_at;
    delete data.created_at;
    delete data.number; // account number

    return $http.put(target, { billingService : data } )
      .then(util.unwrapHttpResponse);
  }

  /**
   * The delete() method deletes data from the database using the API endpoint.
   *
   * @param {Number} id - the id of the billing service.
   * @return {Promise} promise - a promise resolving to an empty object.
   */
  function del(id) {
    var target = url.concat(id);
    return $http.delete(target)
      .then(util.unwrapHttpResponse);
  }
}
