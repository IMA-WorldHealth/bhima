angular.module('bhima.components')
  .component('bhInventorySelect', {
    templateUrl : 'modules/templates/bhInventorySelect.tmpl.html',
    controller  : InventorySelectController,
    transclude  : true,
    bindings    : {
      inventoryUuid    : '<',
      onSelectCallback : '&',
      required         : '<?',
      validateTrigger  : '<?',
      onlyConsumable   : '<?',
    },
  });

InventorySelectController.$inject = [
  'InventoryService', 'NotifyService',
];

/**
 * Inventory selection component
 */
function InventorySelectController(Inventory, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // fired when an inventory has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    const promise = $ctrl.onlyConsumable
      ? Inventory.read(null, { consumable : 1 })
      : Inventory.read();

    // load all inventories
    promise
      .then((inventories) => {
        $ctrl.inventories = inventories;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = ($item) => {
    $ctrl.onSelectCallback({ inventory : $item });
  };
}
