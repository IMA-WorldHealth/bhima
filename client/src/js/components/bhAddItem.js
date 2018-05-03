angular.module('bhima.components')
  .component('bhAddItem', {
    templateUrl : 'modules/templates/bhAddItem.tmpl.html',
    controller  : addItemController,
    bindings    : {
      callback    : '&',
      disable     : '<?',
    },
  });

/**
 * Add Item component
 */
function addItemController() {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // default for form name
    $ctrl.name = 'AddItemForm';

    // default value for incrementation
    $ctrl.itemIncrement = 1;

    if (!angular.isDefined($ctrl.disable)) {
      $ctrl.disable = false;
    }
  };

  // fires the Callback bound to the component boundary
  $ctrl.addItems = $item => {
    if ($item > 0) {
      $ctrl.callback({ numItem : $item });
    }
  };
}
