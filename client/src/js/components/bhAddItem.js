angular.module('bhima.components')
  .component('bhAddItem', {
    templateUrl : 'modules/templates/bhAddItem.tmpl.html',
    controller  : addItemController,
    transclude  : true,
    bindings    : {
      disable          : '<',
      callback         : '&?',
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
    $ctrl.name = 'AddItemForm';
    
    // default value for incrementation
    $ctrl.itemIncrement = 1;
  };

  // fires the Callback bound to the component boundary
  $ctrl.addItems = function ($item) {
    if ($item > 0) {
      $ctrl.callback({ numItem : $item });  
    }
  };
}
