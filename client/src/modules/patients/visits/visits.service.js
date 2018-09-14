angular.module('bhima.services')
  .service('VisitService', VisitService);

VisitService.$inject = ['$http', 'util', '$uibModal'];

function VisitService($http, util, Modal) {
  const service = this;
  const baseUrl = '/patients';

  // send/receive with $http
  service.read = read;
  service.admit = admit;
  service.discharge = discharge;
  service.diagnoses = diagnoses;

  // open modal configuration
  service.openAdmission = openAdmission;

  function read(patientUuid, options) {
    if (!patientUuid) { return 0; }

    return $http.get(`${baseUrl}/${patientUuid}/visits`, { params : options })
      .then(util.unwrapHttpResponse);
  }

  function admit(patientUuid, visitDetails) {
    if (!patientUuid) { return 0; }

    // format admission specific information
    const details = angular.copy(visitDetails);

    if (details.notes) {
      details.start_notes = details.notes;
      delete details.notes;
    }

    if (details.diagnosis) {
      details.start_diagnosis_id = details.diagnosis.id;
    }

    delete details.diagnosis;

    return $http.post(`${baseUrl}/${patientUuid}/visits/admission`, details)
      .then(util.unwrapHttpResponse);
  }

  function discharge(patientUuid, visitDetails) {
    if (!patientUuid) { return 0; }

    // format admission specific information
    const details = angular.copy(visitDetails);

    if (details.notes) {
      details.end_notes = details.notes;
      delete details.notes;
    }

    if (details.diagnosis) {
      details.end_diagnosis_id = details.diagnosis.id;
    }

    delete details.diagnosis;
    delete details.hospitalized;

    return $http.post(`${baseUrl}/${patientUuid}/visits/discharge`, details)
      .then(util.unwrapHttpResponse);
  }

  function diagnoses() {
    return $http.get('/diagnoses')
      .then(util.unwrapHttpResponse);
  }

  // admission vs. discharge
  function openAdmission(patientUuid, isAdmission, currentVisit) {
    const modalOptions = {
      templateUrl : 'modules/patients/visits/visits.modal.html',
      controller : 'VisitsAdmissionController',
      controllerAs : 'AdmitCtrl',
      keyboard : false,
      size : 'md',
      resolve : {
        patient : () => patientUuid,
        isAdmission : () => isAdmission,
        currentVisit : () => currentVisit,
      },
    };

    const instance = Modal.open(modalOptions);
    return instance.result;
  }
}
