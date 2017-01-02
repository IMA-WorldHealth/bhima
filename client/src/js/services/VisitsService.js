angular.module('bhima.services')
.service('VisitService', VisitService);

VisitService.$inject = [ '$http', 'util', '$uibModal' ];

function VisitService($http, util, Modal) {
  var service = this;
  var baseUrl = '/patients/';

  service.read = read;
  service.checkin = checkin;

  service.openAdmission = openAdmission;

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

  // admission vs. discharge
  function openAdmission(isAdmission, currentVisit) {
    var modalOptions = {
      templateUrl : 'partials/patients/record/units/visits.modal.html',
      controller : 'VisitsAdmissionController',
      controllerAs : 'AdmitCtrl',
      size : 'md',
      backdrop : 'static',
      animation : false,
      resolve : {
        isAdmission : function isAdmissionProvider() { return isAdmission; },
        currentVisit : function currentVisitProvider() { return currentVisit; }
      }
    };

    var instance = Modal.open(modalOptions);
    return instance.result;
  }
}

