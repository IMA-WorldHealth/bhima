angular.module('bhima.services')
.service('VisitService', VisitService);

VisitService.$inject = [ '$http', 'util' ];

function VisitService($http, util) {
  var service = this;
  var baseUrl = '/patients/';
 
  service.read = read;
  service.checkin = checkin; 
  
  function read(patientUuid, options) { 
    if (!patientUuid) { 
      return;
    }
    return $http.get(baseUrl.concat(patientUuid, '/visits'), { params : options })
      .then(util.unwrapHttpResponse);
  }
  
  function checkin(patientUuid) {
    if (!patientUuid) { 
      return;
    }
    return $http.post(baseUrl.concat(patientUuid, '/checkin'))
      .then(util.unwrapHttpResponse);
  }
}
 
