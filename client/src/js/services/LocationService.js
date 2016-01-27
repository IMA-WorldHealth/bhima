angular.module('bhima.services')
  .factory('LocationService', LocationService);
  
LocationService.$inject = ['$http', 'util'];

function LocationService($http, util) {  
  var service = {};

  service.readLocations = readLocations;

  function readLocations() {
    var url = '/location/villages';
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
