angular.module('bhima.services')
.service('GradeService', GradeService);

GradeService.$inject = [ '$http', 'util' ];

function GradeService ($http, util) {
  var service = this;
  var baseUrl = '/grades/';

  service.read = read;

  function read(uuid, params) {
     var url = baseUrl.concat(uuid || '');
     return $http.get(url, { params : params })
     .then(util.unwrapHttpResponse);
  }

  return service;
}