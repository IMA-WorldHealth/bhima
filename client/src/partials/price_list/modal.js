angular.module('bhima.controllers')
.controller('PriceListModalController', PriceListModalController);

PriceListModalController.$inject = [
  '$uibModalInstance', 'InventoryService'
];

function PriceListModalController( $uibModalInstance, Inventory) {
  var vm = this;

  // bind variables

  vm.submit = submit;
  vm.cancel = cancel;
  vm.action = null;

  // load Inventory 
  Inventory.getInventoryItems()
  .then(function (data) {
    vm.inventories = data;
  }).catch(handler);

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;

  vm.data = { is_percentage : 0 };

  function handler(error) {
    throw error;
  }

  function submit(invalid) {
    if (invalid) { return; }
    return $uibModalInstance.close(vm.data);
  }

  function cancel() {
    $uibModalInstance.dismiss();
  }

}
