angular.module('bhima.controllers')
.controller('SearchInventoriesModalController', SearchInventoriesModalController);

// dependencies injections
SearchInventoriesModalController.$inject = [
  'DepotService', 'InventoryService', 'NotifyService', '$uibModalInstance',
  'SearchFilterFormatService',
];

function SearchInventoriesModalController(Depots, Inventory, Notify, Instance, SearchFilterFormat) {
  var vm = this;

  // global methods
  vm.cancel = Instance.close;
  vm.submit = submit;

  // load depots
  Depots.read()
  .then(function (depots) {
    vm.depots = depots;
  })
  .catch(Notify.handleError);

  // load inventories
  Inventory.read()
  .then(function (inventories) {
    vm.inventories = inventories;
  })
  .catch(Notify.handleError);

  function submit() {
    var params = SearchFilterFormat.formatFilter(vm.bundle, true);
    Instance.close(params);
  }

}
