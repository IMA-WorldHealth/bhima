angular.module('bhima.services')
.service('VisitService', VisitService);

VisitService.$inject = [ '$http', 'util', '$uibModal' ];

function VisitService($http, util, Modal) {
  var service = this;
  var baseUrl = '/patients/';

  // send/recieve with $http
  service.read = read;
  service.admit = admit;
  service.discharge = discharge;
  service.diagnoses = diagnoses;

  // open modal configuration
  service.openAdmission = openAdmission;

  function read(patientUuid, options) {
    if (!patientUuid) {
      return;
    }
    return $http.get(baseUrl.concat(patientUuid, '/visits'), { params : options })
      .then(util.unwrapHttpResponse);
  }

  function admit(patientUuid, visitDetails) {
    if (!patientUuid) { return; }

    // format admission specific information
    var details = angular.copy(visitDetails);
    details.start_diagnosis_id = details.diagnosis.id;

    if (details.notes) {
      details.start_notes = details.notes;
      delete details.notes;
    }

    delete details.diagnosis;

    return $http.post(baseUrl.concat(patientUuid, '/visits/admission'), details)
      .then(util.unwrapHttpResponse);
  }

  function discharge(patientUuid, visitDetails) {
    if (!patientUuid) { return; }

    // format admission specific information
    var details = angular.copy(visitDetails);

    if (details.notes) {
      details.end_notes = details.notes;
      delete details.notes;
    }

    details.end_diagnosis_id = details.diagnosis.id;
    delete details.diagnosis;

    return $http.post(baseUrl.concat(patientUuid, '/visits/discharge'), details)
      .then(util.unwrapHttpResponse);
  }

  function diagnoses() {
    return $http.get('/diagnoses')
      .then(util.unwrapHttpResponse);
  }

  // admission vs. discharge
  function openAdmission(patientUuid, isAdmission, currentVisit) {
    var modalOptions = {
      templateUrl : 'modules/patients/record/units/visits.modal.html',
      controller : 'VisitsAdmissionController',
      controllerAs : 'AdmitCtrl',
      size : 'md',
      backdrop : 'static',
      animation : false,
      resolve : {
        patient : function patientProvider() { return patientUuid; },
        isAdmission : function isAdmissionProvider() { return isAdmission; },
        currentVisit : function currentVisitProvider() { return currentVisit; }
      }
    };

    var instance = Modal.open(modalOptions);
    return instance.result;
  }
}
