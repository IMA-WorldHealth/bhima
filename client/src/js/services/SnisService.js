angular.module('bhima.services')
  .factory('SnisService', SnisService);
  
SnisService.$inject = ['$http', 'util'];

function SnisService($http, util) {  
  var service = {};

  service.readSnisZs = SnisZs;

  function SnisZs() {
    var url = '/snis/get_snis_zs';
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
