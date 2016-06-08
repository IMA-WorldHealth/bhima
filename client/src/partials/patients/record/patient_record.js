angular.module('bhima.controllers')
.controller('PatientRecordController', PatientRecordController);

PatientRecordController.$inject = ['$state', '$stateParams', 'PatientService', 'NotifyService', 'moment'];

function PatientRecordController($state, $stateParams, Patients, Notify, moment) {
  var vm = this;
  var patientID = $stateParams.patientID;
  
  console.log('Patient Controller Fired');
  // $state.transitionTo('patientRecord.units');
  
  vm.loading = true;
  /** @fixme if no uuid is provided this will download all the patients through the base url '/' */
  Patients.read(patientID)
    .then(function (result) {
      console.log('downloaded', result);
      vm.patient = result;
      vm.loading = false;

      /** @todo move to service or mysql query */
      vm.patient.name = [vm.patient.first_name, vm.patient.middle_name, vm.patient.last_name].join(' ');
      vm.patient.age = moment().diff(vm.patient.dob, 'years');
    })
    .catch(function (error) {
      vm.loading = false;
      Notify.handleError(error);
    });

}
