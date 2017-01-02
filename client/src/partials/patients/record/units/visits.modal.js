angular.module('bhima.controllers')
.controller('VisitsAdmissionController', VisitsAdmissionController);

VisitsAdmissionController.$inject = ['$uibModalInstance'];

function VisitsAdmissionController(ModalInstance) {
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

  vm.diagnosis = mockDiagnosis;

  vm.cancel = ModalInstance.close;
}

