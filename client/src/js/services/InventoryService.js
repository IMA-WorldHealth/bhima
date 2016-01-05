angular.module('bhima.services')
.service('InventoryService', InventoryService);

InventoryService.$inject = [ '$http' ];

function InventoryService($http) {
  var service = this;

  // bind service methods
  service.getInventoryItems = getInventoryItems;

  /* ------------------------------------------------------------------------ */

  // wraps HTTP GET requests to only return the data portion.
  function get(url) {
    return $http.get(url)
    .then(function (response) {
      return response.data;
    });
  }

  // optionally takes in a UUID to specify a single item
  function getInventoryItems(uuid) {
    var url = uuid ?
      '/inventory/:uuid/metadata' :
      '/inventory/metadata';
    return get(url.replace(':uuid', uuid));
  }
}
