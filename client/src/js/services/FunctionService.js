angular.module('bhima.services')
.service('FunctionService', FunctionService);

FunctionService.$inject = [ '$http', 'util' ];

function FunctionService ($http, util) {
  var service = this;
  var baseUrl = '/functions/';

  service.read = read;

  function read(id, params) {
     var url = baseUrl.concat(id || '');
     return $http.get(url, { params : params })
     .then(util.unwrapHttpResponse);
  }

  return service;
}