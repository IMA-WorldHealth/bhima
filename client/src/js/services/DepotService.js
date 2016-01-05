angular.module('bhima.services')
.service('DepotService', DepotService);

DepotService.$inject = ['$http'];

/**
* Depot Service
* 
* Encapuslates common requests to the /depots/ endpoint.
*/
function DepotService($http) {
  var service = this;

  service.getDepots = getDepots;
  service.getAvailableStock = getAvailableStock;

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
    return get(depotId === undefined ? '/depots' :'/depots/' + depotId);
  }

  // GET a list of lots in available in a single depot.  Filters by expiration
  // date, and quantity === 0.
  function getAvailableStock(depotId) {
    return get('/depots/' + depotId + '/inventory');
  }

  // TODO -- implement the rest of the depots API in this service.


}
