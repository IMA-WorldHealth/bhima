angular.module('bhima.controllers')
  .controller('ReturningPatientModalController', ReturningPatientModalCtrl);

ReturningPatientModalCtrl.$inject = [
  '$uibModalInstance', 'PatientService', 'moment',
];

function ReturningPatientModalCtrl(ModalInstance, Patients, moment) {
  const vm = this;

  vm.params = {};
  vm.isPatientFound = false;

  vm.cancel = ModalInstance.close;

  vm.submit = function submit() {
    return Patients.read(null, vm.params)
      .then(patients => {
        [vm.patient] = patients;
        vm.patient.dobFormatted = moment(vm.patient.dob).format('L');
        vm.patient.age = moment().diff(vm.patient.dob, 'years');

        vm.isPatientFound = true;
      });
  };
}
