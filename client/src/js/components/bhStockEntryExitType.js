angular.module('bhima.components')
    .component('bhStockEntryExitType', {
      templateUrl : 'modules/templates/bhStockEntryExitType.tmpl.html',
      controller : StockEntryExitTypeController,
      bindings : {
        onEntryExitTypeSelectCallback : '&',
        reference : '<?',
        displayName : '<?',
        isEntry : '@',
        depot : '<?',
      },
    });

StockEntryExitTypeController.$inject = ['StockEntryExitTypeService'];

/**
 * Stock Entry Exit Type component
 */
function StockEntryExitTypeController(StockEntryExitType) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.isEntry = $ctrl.isEntry === 'true';

    reloadEntryExitTypes();
  };

  $ctrl.$onChanges = function onChanges(changes) {
    if (changes.depot) {
      reloadEntryExitTypes();
    }
  };

  $ctrl.display = function () {
    var list;

    if ($ctrl.isEntry === true) {
      return $ctrl.reference || '';
    }

    list = [];

    if ($ctrl.reference) {
      list.push($ctrl.reference);
    }

    if ($ctrl.displayName) {
      list.push($ctrl.displayName);
    }

    return list.join(' - ');
  };

  $ctrl.selectEntryExitType = function (type) {
    $ctrl.selectedEntryExitType = type;
    $ctrl.onEntryExitTypeSelectCallback({ type : type });
  };

  // reload entry/exit types
  function reloadEntryExitTypes() {
    $ctrl.selectedEntryExitType = null;
    $ctrl.depot = $ctrl.depot || {};

    $ctrl.entryExitTypeList = StockEntryExitType.getAllowedTypes($ctrl.depot);
  }
}
