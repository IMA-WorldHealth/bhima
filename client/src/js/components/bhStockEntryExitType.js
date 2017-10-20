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

StockEntryExitTypeController.$inject = [];

/**
 * Stock Entry Exit Type component
 */
function StockEntryExitTypeController() {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.isEntry = $ctrl.isEntry === 'true';

    reloadEntryExitTypes();
  };

  $ctrl.$onChanges = function onChanges() {
    reloadEntryExitTypes();
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

    $ctrl.entryExitTypeList = [
      { label : 'patient',
        labelKey : 'PATIENT_REG.ENTITY',
        descriptionKey : 'STOCK.PATIENT_DISTRIBUTION',
        isEntry : false,
        allowed : $ctrl.depot.allow_exit_debtor },

      { label : 'service',
        labelKey : 'SERVICE.ENTITY',
        descriptionKey : 'STOCK.SERVICE_DISTRIBUTION',
        isEntry : false,
        allowed : $ctrl.depot.allow_exit_service },

      { label : 'depot',
        labelKey : 'DEPOT.ENTITY',
        descriptionKey : 'STOCK.DEPOT_DISTRIBUTION',
        isEntry : false,
        allowed : $ctrl.depot.allow_exit_transfer },

      { label : 'loss',
        labelKey : 'STOCK.EXIT_LOSS',
        descriptionKey : 'STOCK.LOSS_DISTRIBUTION',
        isEntry : false,
        allowed : $ctrl.depot.allow_exit_loss },

      { label : 'purchase',
        labelKey : 'STOCK.ENTRY_PURCHASE',
        descriptionKey : 'STOCK_FLUX.FROM_PURCHASE',
        isEntry : true,
        allowed : $ctrl.depot.allow_entry_purchase },

      { label : 'integration',
        labelKey : 'STOCK.INTEGRATION',
        descriptionKey : 'STOCK_FLUX.FROM_INTEGRATION',
        isEntry : true,
        allowed : $ctrl.depot.allow_entry_integration },

      { label : 'donation',
        labelKey : 'STOCK.DONATION',
        descriptionKey : 'STOCK_FLUX.FROM_DONATION',
        isEntry : true,
        allowed : $ctrl.depot.allow_entry_donation },

      { label : 'transfer_reception',
        labelKey : 'STOCK.RECEPTION_TRANSFER',
        descriptionKey : 'STOCK_FLUX.FROM_TRANSFER',
        isEntry : true,
        allowed : $ctrl.depot.allow_entry_transfer },
    ];
  }
}
