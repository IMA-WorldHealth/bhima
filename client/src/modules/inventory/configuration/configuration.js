angular.module('bhima.controllers')
.controller('InventoryConfigurationController', InventoryConfigurationController);

/** Inventory Configuration controller */
function InventoryConfigurationController() {
  var vm = this;

  /** paths in the headercrumb */
  vm.bcPaths = [
    { label : 'TREE.INVENTORY' },
    { label : 'TREE.INVENTORY_CONFIGURATION' }
  ];

}
