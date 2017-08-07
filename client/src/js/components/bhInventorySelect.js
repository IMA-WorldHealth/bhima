angular.module('bhima.components')
  .component('bhInventorySelect', {
    templateUrl : 'modules/templates/bhInventorySelect.tmpl.html',
    controller  : InventorySelectController,
    transclude  : true,
    bindings    : {
      inventoryUuid    : '<',
      onSelectCallback : '&',
      required         : '<?',      
    },
  });

InventorySelectController.$inject = [
  'InventoryService', 'NotifyService'
];

/**
 * Inventory selection component
 */
function InventorySelectController(Inventory, Notify) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {    
    // fired when an inventory has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // load all inventories
    Inventory.read()
      .then(function (inventories) { 
        $ctrl.inventories = inventories;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item, $model) {
    $ctrl.onSelectCallback({ inventory : $item });
  };
}
