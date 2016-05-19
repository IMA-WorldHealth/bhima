angular.module('bhima.controllers')
.controller('PatientRegistryModalController', PatientRegistryModalController);

PatientRegistryModalController.$inject = [
  '$uibModalInstance', 'InventoryService', 'PatientService', 'util', 'DateService'
];

function PatientRegistryModalController( $uibModalInstance, Inventory, patients, util, dateService) {
  var vm = this;

  vm.period = dateService.period();
  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.setTimes = setTimes;
  vm.today = new Date();
  vm.patient = {};

  vm.data = { is_percentage : 0 };

  function submit(form) {
    if (form.$invalid) { return; }
    vm.patient = util.clean(vm.patient);

    var patient = angular.copy(vm.patient);
    patient.detail = 1;
    
    var promise = patients.search(patient);
    var patientFilters = patients.patientFilters(patient);

    promise
    .then(function (response) {   
      var data = {
        response : response,
        filters   : patientFilters 
      };
      
      return $uibModalInstance.close(data);

    });    
  }

  function setTimes(times){
     // the dateRegistrationTo never changes, so we set it at the beginning
     vm.patient.dateRegistrationTo = new Date();

     switch (times) {
        case 'today' :
          vm.patient.dateRegistrationFrom = new Date();
          break;
        case 'week' :
          vm.patient.dateRegistrationFrom = dateService.previous.week();
          break;
        case 'month' :
          vm.patient.dateRegistrationFrom = dateService.previous.month();
          break;
        default:
          vm.patient.dateRegistrationFrom = dateService.previous.year();
    }
  }

  function cancel() {
    $uibModalInstance.dismiss();
  }

}
