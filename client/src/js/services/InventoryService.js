angular.module('bhima.services')
.service('InventoryService', InventoryService);

InventoryService.$inject = [ '$http' ];

function InventoryService($http) {
  var service = this;

  // bind service methods
  service.read = read;
  // FIXME this getInventoryItems function need to be deleted
  service.getInventoryItems = read;

  /* ------------------------------------------------------------------------ */

  // wraps HTTP GET requests to only return the data portion.
  function get(url) {
    return $http.get(url)
    .then(function (response) {
      return response.data;
    });
  }

  // optionally takes in a UUID to specify a single item
  function read(uuid) {
    var url = uuid ?
      '/inventory/:uuid/metadata' :
      '/inventory/metadata';
    return get(url.replace(':uuid', uuid));
  }
}
