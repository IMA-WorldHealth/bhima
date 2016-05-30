angular.module('bhima.controllers')
.controller('PatientDocumentsController', PatientDocumentsController);

PatientDocumentsController.$inject = [
  '$state', 'PatientService', 'NotifyService'
];

function PatientDocumentsController($state, Patients, Notify) {
  var vm = this;

  /** global objects */
  vm.patientUuid = $state.params.patient_uuid;

  /** getting patient details */
  Patients.read(vm.patientUuid)
  .then(function (patient) {
    vm.formatedPatientName = patient.first_name.concat(
      ' ', patient.middle_name,
      ' ', patient.last_name);
  })
  .catch(Notify.handleError);

}
