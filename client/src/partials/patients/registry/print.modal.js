angular.module('bhima.controllers')
.controller('PatientRegistryPrintController', PatientRegistryPrintCtrl);

PatientRegistryPrintCtrl.$inject = [
  '$http', '$uibModalInstance', 'filters'
];

function PatientRegistryPrintCtrl($http, ModalInstance, data) {
  var vm = this;
  vm.data = data;

  // request the report from the server
  $http.get(data.url, { params : data.params })
  .then(function (report) {
    vm.report = report;
  });
}

