angular.module('bhima.controllers')
.controller('CheckInController', CheckInController);

CheckInController.$inject = ['$stateParams', 'PatientService'];

function CheckInController($stateParams, Patients) { 
  var vm = this;
  var id = $stateParams.patientID;

  // total number of visits to display in the 'Recent Visits' component
  var limitVisitsDisplay = 2;

  vm.loaded = false;
  
  Patients.Visits.read(id, {limit : limitVisitsDisplay})
    .then(function (visits) {
      vm.loaded = true;
      vm.visits = visits; 
    });
  
}