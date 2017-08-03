angular.module('bhima.components')
  .component('bhInventorySelect', {
    templateUrl : 'modules/templates/bhInventorySelect.tmpl.html',
    controller  : InventorySelectController,
    transclude  : true,
    bindings    : {
      inventoryId      : '<',
      disable          : '<?',
      onSelectCallback : '&',
      name             : '@?',
      required         : '<?',      
    },
  });

InventorySelectController.$inject = [
  'InventoryService'
];

/**
 * Inventory selection component
 */
function InventorySelectController(Inventory) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {    
    // fired when an user has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'InventoryForm';

    // load all inventories
    Inventory.read()
      .then(function (inventories) { 
        $ctrl.inventories = inventories;
      });

    $ctrl.valid = true;
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item, $model) {
    $ctrl.onSelectCallback({ inventory : $item });
  };
}
