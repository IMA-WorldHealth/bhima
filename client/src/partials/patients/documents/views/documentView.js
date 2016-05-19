angular.module('bhima.controllers')
.controller('DocumentViewController', DocumentViewController);

DocumentViewController.$inject = [
  '$translate', '$state', '$uibModal', 'PatientService', 'util', 'Upload'
];

function DocumentViewController($translate, $state, $uibModal, patients, util, Upload) {
  var vm = this;

  vm.patientUuuid = $state.params.patient_uuid;

}
