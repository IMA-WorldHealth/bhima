angular.module('bhima.controllers')
.controller('PatientRegistryModalController', PatientRegistryModalController);

PatientRegistryModalController.$inject = [
  '$uibModalInstance', 'InventoryService', 'PatientService', 'util', 'DateService'
];

function PatientRegistryModalController(ModalInstance, Inventory, Patients, util, Dates) {
  var vm = this;

  vm.period = Dates.period();

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
    patient.detailed = 1;

    var promise = Patients.search(patient);
    var patientFilters = Patients.patientFilters(patient);

    promise
    .then(function (response) {
      var data = {
        response : response,
        filters   : patientFilters
      };

      return ModalInstance.close(data);

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
          vm.patient.dateRegistrationFrom = Dates.previous.week();
          break;
        case 'month' :
          vm.patient.dateRegistrationFrom = Dates.previous.month();
          break;
        default:
          vm.patient.dateRegistrationFrom = Dates.previous.year();
    }
  }

  function cancel() {
    ModalInstance.dismiss();
  }

}
