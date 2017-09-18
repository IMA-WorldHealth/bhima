angular.module('bhima.components')
  .component('bhAddItem', {
    templateUrl : 'modules/templates/bhAddItem.tmpl.html',
    controller  : addItemController,
    transclude  : true,
    bindings    : {
      itemIncrement    : '<',
      recipient        : '<',
      disable          : '<?',
      onChange         : '&?',
      name             : '@?',
    },
  });

addItemController.$inject = [];

/**
 * Add Item component
 *
 */
function addItemController() {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {    
    // default for form name
    $ctrl.name = $ctrl.name || 'AddItemForm';
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.addItems = function ($item) {
    if ($item > 0) {
      $ctrl.onChange({ item : $item });  
    }
  };
}
