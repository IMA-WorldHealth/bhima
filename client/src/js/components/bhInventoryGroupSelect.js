angular.module('bhima.components')
  .component('bhInventoryGroupSelect', {
    templateUrl : 'modules/templates/bhInventoryGroupSelect.tmpl.html',
    controller  : InventoryGroupSelectController,
    transclude  : true,
    bindings    : {
      groupUuid        : '<',
      onSelectCallback : '&',      
    },
  });

InventoryGroupSelectController.$inject = [
  'InventoryService', 'NotifyService',
];

/**
 * Inventory Group Select Controller
 *
 */
function InventoryGroupSelectController(Inventory, Notify) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {    

    Inventory.Groups.read()
      .then(function (inventoryGroups) {
        $ctrl.inventoryGroups = inventoryGroups;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item, $model) {
    $ctrl.onSelectCallback({ group : $item });
  };
}