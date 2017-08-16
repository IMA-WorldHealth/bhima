angular.module('bhima.controllers')
  .controller('StockFindDepotModalController', StockFindDepotModalController);

StockFindDepotModalController.$inject = [
  '$uibModalInstance', 'DepotService', 'NotifyService', 'data',
];

function StockFindDepotModalController(Instance, Depot, Notify, Data) {
  var vm = this;

  // global
  vm.selected = {};

  // bind methods
  vm.Data = Data;
  vm.submit = submit;
  vm.cancel = cancel;
  vm.onSelectDepot = onSelectDepot;

  // on select depot
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
