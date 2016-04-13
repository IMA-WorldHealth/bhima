angular.module('bhima.services')
.service('DepotService', DepotService);

DepotService.$inject = ['$http', 'util'];

/**
* Depot Service
*
* Encapuslates common requests to the /depots/ endpoint.
*/
function DepotService($http, util) {
  var service = this,
      baseUrl = '/depots/';

  service.getDepots = getDepots;
  service.getAvailableStock = getAvailableStock;
  service.create = create;
  service.update = update;
  service.remove = remove;

  /* ------------------------------------------------------------------------ */

  // utility method to make sure we always return data, instead of the HTTP
  // response object.  Performs an HTTP GET request, then returns only the data
  // portion of the returned promise to the consumer.
  function get(url) {
    return $http.get(url)
    .then(function (response) {
      return response.data;
    });
  }

  // GET a list of depots for current enterprise.  If an ID is supplied, returns
  // the details of a single depot.
  function getDepots(depotId) {
    var url = baseUrl.concat(depotId || '');
    return get(url);
  }

  // GET a list of lots in available in a single depot.  Filters by expiration
  // date, and quantity === 0.
  function getAvailableStock(depotId) {
    return get(baseUrl + depotId + '/inventory');
  }

  // TODO -- implement the rest of the depots API in this service.

  /**
  * @function create
  * @param {object} depot The depot object
  * @description Create a new depot
  */
  function create(depot) {
    return $http.post(baseUrl, depot)
    .then(util.unwrapHttpResponse);
  }

  /**
  * @function update
  * @param {string} uuid The depot uuid
  * @param {object} depot The update depot data
  * @description Edit an existing depot
  */
  function update(uuid, depot) {
    return $http.put(baseUrl + uuid, depot)
    .then(util.unwrapHttpResponse);
  }

  /**
  * @function delete
  * @param {string} uuid The depot uuid
  * @param {object} depot The update depot data
  * @description Delete an existing depot
  */
  function remove(uuid, depot) {
    return $http.delete(baseUrl + uuid, depot)
    .then(util.unwrapHttpResponse);
  }

}
