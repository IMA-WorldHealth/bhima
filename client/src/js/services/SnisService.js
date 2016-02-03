angular.module('bhima.services')
  .factory('SnisService', SnisService);
  
SnisService.$inject = ['$http', 'util'];

function SnisService($http, util) {  
  var service = {};

  service.healthZones = healthZones;

  function healthZones() {
    var url = '/snis/health_zones';
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
