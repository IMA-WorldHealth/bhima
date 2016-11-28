angular.module('bhima.controllers')
.controller('PriceListModalController', PriceListModalController);

PriceListModalController.$inject = [
  '$uibModalInstance', 'InventoryService', 'util', 'NotifyService'
];

function PriceListModalController( $uibModalInstance, Inventory, util, Notify) {
  var vm = this;

  // bind variables
  vm.submit = submit;
  vm.cancel = cancel;
  vm.action = null;
  vm.isValidItem = isValidItem;

  // load Inventory
  Inventory.read()
    .then(function (inventory) {
      vm.inventories = inventory;
    })
    .catch(Notify.handleError);

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.length250 = util.length250;

  vm.data = { is_percentage : 0 };

  function isValidItem() {
    var hasNegativePrice = (!vm.data.is_percentage && vm.data.value < 0);

    if (hasNegativePrice) {
      vm.error = 'PRICE_LIST.ERRORS.HAS_NEGATIVE_PRICE';
      Notify.danger(vm.error);
    }

    return !hasNegativePrice;
  }

  function submit(invalid) {
    if (invalid) { return; }

    // make sure that there are no negative prices
    if (!isValidItem()) {
      return;
    }

    return $uibModalInstance.close(vm.data);
  }

  function cancel() {
    $uibModalInstance.dismiss();
  }
}
