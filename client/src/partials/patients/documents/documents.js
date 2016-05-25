angular.module('bhima.controllers')
.controller('PatientDocumentsController', PatientDocumentsController);

PatientDocumentsController.$inject = [
  '$translate', '$state'
];

function PatientDocumentsController($translate, $state) {
  var vm = this;

  /** breadcrumb definitions */
  vm.paths = [{
    label : $translate.instant('PATIENT_DOCUMENT.TITLE'),
    current: true
  }];

  /** global objects */
  vm.patient = {};

  /** expose to the view */
  vm.setPatient  = setPatient;

  /** functions definition */
  function setPatient(patient) {
    vm.patient = patient;
    $state.go('patientDocuments.view', { patient_uuid: patient.uuid });
  }

}
