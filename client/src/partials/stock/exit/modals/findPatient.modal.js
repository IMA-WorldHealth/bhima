angular.module('bhima.controllers')
  .controller('StockFindPatientModalController', StockFindPatientModalController);

StockFindPatientModalController.$inject = [
  '$uibModalInstance', 'PatientService', 'NotifyService',
];

function StockFindPatientModalController(Instance, Patient, Notify) {
  var vm = this;

  // global
  vm.selected = {};

  // bind methods
  vm.setPatient = setPatient;
  vm.submit = submit;
  vm.cancel = cancel;

  Patient.read()
  .then(function (patients) {
    vm.patients = patients;
  })
  .catch(Notify.errorHandler);

  // set patient
  function setPatient(patient) {
    vm.selected = patient;
  }

  // submit
  function submit() {
    Instance.close(vm.selected);
  }

  // cancel
  function cancel() {
    Instance.dismiss();
  }

}
