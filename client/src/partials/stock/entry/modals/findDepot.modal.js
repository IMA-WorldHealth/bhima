angular.module('bhima.controllers')
  .controller('StockFindDepotModalController', StockFindDepotModalController);

StockFindDepotModalController.$inject = [
  '$uibModalInstance', 'DepotService', 'NotifyService', 'data',
];

function StockFindDepotModalController(Instance, Depot, Notify, Data) {
  var vm = this;
  var bundle = {};

  // global
  vm.selected = {};

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;

  Depot.read()
  .then(function (depots) {
    bundle.depots = depots;
    return depots.findIndex(function (item) {
      return item.uuid === Data.depot.uuid;
    });
  })
  .then(function (idx) {
    bundle.depots.splice(idx, 1);
    vm.depots = bundle.depots;
  })
  .catch(Notify.errorHandler);

  // submit
  function submit() {
    Instance.close(vm.selected);
  }

  // cancel
  function cancel() {
    Instance.dismiss();
  }

}
