angular.module('bhima.components')
    .component('bhStockEntryExitType', {
        templateUrl: 'modules/templates/bhStockEntryExitType.tmpl.html',
        controller: StockEntryExitTypeController,
        bindings: {
            onEntryExitTypeSelectCallback: '&',
            reference: '<?',
            displayName: '<?',
            isEntry: '@'
        },
    });

StockEntryExitTypeController.$inject = [];

/**
 * Stock Entry Exit Type component
 */
function StockEntryExitTypeController() {
    var $ctrl = this;

    $ctrl.$onInit = function onInit () {
      $ctrl.selectedEntryExitType = null;
      $ctrl.isEntry = $ctrl.isEntry === 'true';

      $ctrl.entryExitTypeList = [
        { label: 'patient', labelKey: 'PATIENT_REG.ENTITY', descriptionKey: 'STOCK.PATIENT_DISTRIBUTION', isEntry: false },
        { label: 'service', labelKey: 'SERVICE.ENTITY', descriptionKey: 'STOCK.SERVICE_DISTRIBUTION', isEntry: false },
        { label: 'depot', labelKey: 'DEPOT.ENTITY', descriptionKey: 'STOCK.DEPOT_DISTRIBUTION', isEntry: false },
        { label: 'loss', labelKey: 'STOCK.EXIT_LOSS', descriptionKey: 'STOCK.LOSS_DISTRIBUTION', isEntry: false },
        { label: 'purchase', labelKey: 'STOCK.ENTRY_PURCHASE', descriptionKey: 'STOCK_FLUX.FROM_PURCHASE', isEntry: true },
        { label: 'integration', labelKey: 'STOCK.INTEGRATION', descriptionKey: 'STOCK_FLUX.FROM_INTEGRATION', isEntry: true },
        { label: 'donation', labelKey: 'STOCK.DONATION', descriptionKey: 'STOCK_FLUX.FROM_DONATION', isEntry: true },
        { label: 'transfer_reception', labelKey: 'STOCK.RECEPTION_TRANSFER', descriptionKey: 'STOCK_FLUX.FROM_TRANSFER', isEntry: true }
      ];
    };

    $ctrl.display = function () {
        if ($ctrl.isEntry === true) {
            return $ctrl.reference || '';
        }
        var list = [];

        if ($ctrl.reference) {
            list.push($ctrl.reference);
        }

        if ($ctrl.displayName) {
            list.push($ctrl.displayName);
        }

        return list.join(' - ');
    }

    $ctrl.selectEntryExitType = function (type) {
        $ctrl.selectedEntryExitType = type;
        $ctrl.onEntryExitTypeSelectCallback({ type: type });
    }
}
