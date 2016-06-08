angular.module('bhima.services')
.service('VisitService', VisitService);

VisitService.$inject = [ '$http', 'util' ];

function VisitService($http, util) {
  var service = this;
  var baseUrl = '/patients/';
 
  service.read = read;
  
  function read(patientUuid, options) { 
    if (!patientUuid) { 
      return;
    }
    return $http.get(baseUrl.concat(patientUuid, '/visits'), { params : options })
      .then(util.unwrapHttpResponse);
  }
}
 
