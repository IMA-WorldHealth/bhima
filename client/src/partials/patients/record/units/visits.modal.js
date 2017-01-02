angular.module('bhima.controllers')
.controller('VisitsAdmissionController', VisitsAdmissionController);

VisitsAdmissionController.$inject = ['$uibModalInstance', 'isAdmission', 'currentVisit'];

function VisitsAdmissionController(ModalInstance, isAdmission, currentVisit) {
  var vm = this;

  var mockDiagnosis = [
    {
      id : 1,
      code : 'A00.1',
      label : 'PROBLEM A'
    },
    {
      id : 2,
      code : 'A00.2',
      label : 'PROBELM B'
    }
  ];

  vm.diagnosese = mockDiagnosis;
  vm.isAdmission = isAdmission;

  vm.cancel = ModalInstance.close;
  vm.admit = admit;

  vm.$loading = false;

  function admit(form) {

    if (form.$invalid) {
      return;
    }
    vm.$loading = true;
  }
}

