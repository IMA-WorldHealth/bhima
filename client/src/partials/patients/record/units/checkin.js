angular.module('bhima.controllers')
.controller('CheckInController', CheckInController);

CheckInController.$inject = ['$stateParams'];

function CheckInController($stateParams) { 
  var id = $stateParams.patientID;
  
}