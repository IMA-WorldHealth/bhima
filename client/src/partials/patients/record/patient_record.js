angular.module('bhima.controllers')
.controller('PatientRecordController', PatientRecordController);

PatientRecordController.$inject = ['$stateParams', 'PatientService', 'NotifyService', 'moment'];

function PatientRecordController($stateParams, Patients, Notify, moment) {
  var vm = this;
  var patientID = $stateParams.patientID;

  Patients.read(patientID)
    .then(function (result) {
      vm.patient = result;

      /** @todo move to service or mysql query */
      vm.patient.name = [vm.patient.first_name, vm.patient.middle_name, vm.patient.last_name].join(' ');
      vm.patient.age = moment().diff(vm.patient.dob, 'years');
      console.log('got patient', result);
    })
    .catch(Notify.handleError);
}
