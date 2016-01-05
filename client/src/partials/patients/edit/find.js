// TODO All find pages should reference the same controller
angular.module('bhima.controllers')
.controller('PatientEditFind', PatientEditFind);

PatientEditFind.$inject = ['$location'];

function PatientEditFind($location) { 
  var viewModel = this;
  
  viewModel.submitPatient = function (patient) {
    $location.path('patients/edit/'.concat(patient.uuid));
  }
}
 
