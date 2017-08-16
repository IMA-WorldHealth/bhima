angular.module('bhima.controllers')
  .controller('StockFindServiceModalController', StockFindServiceModalController);

StockFindServiceModalController.$inject = [
  '$uibModalInstance', 'ServiceService', 'data',
];

function StockFindServiceModalController(Instance, Service, Data) {
  var vm = this;

  // global
  vm.selected = {};

  // bind methods
  vm.Data = Data;
  vm.submit = submit;
  vm.cancel = cancel;
  vm.onSelectDepot = onSelectDepot;

  // on select depot as service
  function onSelectDepot(depot) {
    vm.selected = depot;
  }

  // submit
  function submit(form) {
    if (form.$invalid) { return; }

    Instance.close(vm.selected);
  }

  // cancel
  function cancel() {
    Instance.dismiss();
  }

}
