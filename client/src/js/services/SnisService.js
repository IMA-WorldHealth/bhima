angular.module('bhima.services')
.service('SnisService', SnisService);
  
SnisService.$inject = ['$http', 'util'];

function SnisService($http, util) {  
  var service = {};

  service.healthZones = healthZones;

  function healthZones() {
    var url = '/snis/healthZones';
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
