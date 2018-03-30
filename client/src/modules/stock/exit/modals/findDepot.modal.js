angular.module('bhima.controllers')
  .controller('StockFindDepotModalController', StockFindDepotModalController);

StockFindDepotModalController.$inject = [
  '$uibModalInstance', 'DepotService', 'NotifyService', 'data',
];

function StockFindDepotModalController(Instance, Depot, Notify, Data) {
  const vm = this;
  const bundle = {};

  // global
  vm.selected = {};

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;

  Depot.read()
    .then(depots => {
      bundle.depots = depots;

      // set defined the previous selected depot
      if (Data.entity_uuid) {
        const currentDepot = depots.filter(item => {
          return item.uuid === Data.entity_uuid;
        });

        vm.selected = currentDepot.length > 0 ? currentDepot[0] : {};
      }

      return depots.findIndex(item => {
        return item.uuid === Data.depot.uuid;
      });
    })
    .then(idx => {
      bundle.depots.splice(idx, 1);
      vm.depots = bundle.depots;
    })
    .catch(Notify.handleError);

  // submit
  function submit() {
    Instance.close(vm.selected);
  }

  // cancel
  function cancel() {
    Instance.close(vm.selected);
  }

}
