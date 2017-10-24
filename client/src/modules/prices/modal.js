angular.module('bhima.controllers')
.controller('PriceListModalController', PriceListModalController);

PriceListModalController.$inject = [
  '$uibModalInstance', 'InventoryService', 'util', 'NotifyService', 'appcache',
];

function PriceListModalController( $uibModalInstance, Inventory, util, Notify, AppCache) {
  var vm = this;

  // bind variables
  vm.submit = submit;
  vm.cancel = cancel;
  vm.action = null;
  vm.isValidItem = isValidItem;

  // Here we load the All items from the list
  var cache = new AppCache('selectedItems');
  var selectedItems = cache.items;

  Inventory.read()
    .then(function (inventory) {
      // Let filter the list,
      // all items in from the list should not appear in the select dropdown list

      // gather all used uuids in a flat array
      var selectedUuids = selectedItems.map(function (item) {
        return item.inventory_uuid;
      });

      // filter the inventory to only show ones that are not used.
      vm.inventories = inventory.filter(function (item) {
        return selectedUuids.indexOf(item.uuid) === -1;
      });

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
