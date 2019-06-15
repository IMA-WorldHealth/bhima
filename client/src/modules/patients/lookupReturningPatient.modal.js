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

  function usePatient(patient) {
    vm.patient = patient;
    vm.patient.dobFormatted = moment(vm.patient.dob).format('L');
    vm.patient.age = moment().diff(vm.patient.dob, 'years');
    vm.isPatientFound = true;
  }

  function warnNoPatients() {
    vm.noPatientsFound = true;
    vm.hasWarning = true;
  }

  function warnMultiplePatients() {
    vm.hasMultiplePatients = true;
    vm.hasWarning = true;
  }

  // clears all visual warnings
  function resetWarnings() {
    vm.noPatientsFound = false;
    vm.hasMultiplePatients = false;
    vm.hasWarning = false;
  }

  vm.submit = function submit() {
    resetWarnings();

    return Patients.read(null, vm.params)
      .then(patients => {

        switch (patients.length) {
        case 0:
          warnNoPatients();
          break;

        case 1:
          usePatient(patients[0]);
          break;

        default:
          warnMultiplePatients();
          break;
        }
      });
  };
}
