angular.module('bhima.controllers')
  .controller('StockFindPatientModalController', StockFindPatientModalController);

StockFindPatientModalController.$inject = [
  '$uibModalInstance', 'PatientService', 'NotifyService', 'data',
];

function StockFindPatientModalController(Instance, Patient, Notify, Data) {
  const vm = this;

  // global
  vm.selected = {};

  // bind methods
  vm.setPatient = setPatient;
  vm.submit = submit;
  vm.cancel = cancel;

  Patient.read()
    .then(patients => {
      vm.patients = patients;

      // set defined the previous selected service
      if (Data.entity_uuid) {
        const currentPatient = patients.filter(item => {
          return item.uuid === Data.entity_uuid;
        });

        vm.selected = currentPatient.length > 0 ? currentPatient[0] : {};
      }
    })
    .catch(Notify.handleError);

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
    Instance.close(vm.selected);
  }

}
