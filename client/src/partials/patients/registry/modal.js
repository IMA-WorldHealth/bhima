angular.module('bhima.controllers')
.controller('PatientRegistryModalController', PatientRegistryModalController);

PatientRegistryModalController.$inject = [
  '$uibModalInstance', 'InventoryService', 'PatientService', 'util'
];

function PatientRegistryModalController( $uibModalInstance, Inventory, patients, util) {
  var vm = this;

  vm.period = {
    today : {
      cacheKey : 'today',
      translateKey : 'FORM.BUTTONS.TODAY',
      id : 'today'
    },
    week : {
      cacheKey : 'week',
      translateKey : 'FORM.BUTTONS.THIS_WEEK',
      id : 'week'
    },
    month : {
      cacheKey : 'month',
      translateKey : 'FORM.BUTTONS.THIS_MONTH',
      id : 'month'
    },
    year : {
      cacheKey : 'year',
      translateKey : 'FORM.BUTTONS.THIS_YEAR',
      id : 'year'
    }
  };  

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.setTimes = setTimes;
  vm.today = new Date();


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
    if (times === 'today'){
      vm.patient = { 
        dateRegistrationFrom : new Date(),
        dateRegistrationTo : new Date() 
      };

    } else if (times === 'week'){
      vm.patient = { 
        dateRegistrationFrom : new Date(),
        dateRegistrationTo : new Date() 
      }; 
      vm.patient.dateRegistrationFrom.setDate(vm.patient.dateRegistrationTo.getDate() - vm.patient.dateRegistrationTo.getDay());
    
    } else if (times === 'month') {
      vm.patient = { 
        dateRegistrationFrom : new Date(),
        dateRegistrationTo : new Date() 
      }; 
      vm.patient.dateRegistrationFrom.setDate(1);
    
    } else {
      var fullYear = new Date().getFullYear();

      vm.patient = { 
        dateRegistrationFrom :new Date(fullYear + '-1-1'),
        dateRegistrationTo : new Date() 
      };      
    }
  }

  function cancel() {
    $uibModalInstance.dismiss();
  }

}
