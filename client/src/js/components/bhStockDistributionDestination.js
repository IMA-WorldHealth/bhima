angular.module('bhima.components')
    .component('bhDistributionDestination', {
        templateUrl: 'modules/templates/bhStockDistributionDestination.tmpl.html',
        controller: DistributionDestinationController,
        bindings: {
            onExitTypeSelectCallback: '&?',
            reference : '<?',
            displayName : '<?'
        },
    });

DistributionDestinationController.$inject = [];

/**
 * Stock Distribution Destination component
 */
function DistributionDestinationController() {
    var $ctrl = this;
    $ctrl.selectedExitType = null;

    $ctrl.exitTypeList = [
        { label: 'patient', labelKey: 'PATIENT_REG.ENTITY', descriptionKey: 'STOCK.PATIENT_DISTRIBUTION' },
        { label: 'service', labelKey: 'SERVICE.ENTITY', descriptionKey: 'STOCK.SERVICE_DISTRIBUTION' },
        { label: 'depot', labelKey: 'DEPOT.ENTITY', descriptionKey: 'STOCK.DEPOT_DISTRIBUTION' },
        { label: 'loss', labelKey: 'STOCK.EXIT_LOSS', descriptionKey: 'STOCK.LOSS_DISTRIBUTION' }
    ];

    $ctrl.selectExitType = function (exitType) {
        $ctrl.selectedExitType = exitType;
        $ctrl.onExitTypeSelectCallback({ exitType: exitType });
    }
}
