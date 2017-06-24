angular.module('bhima.components')
    .component('bhFiscalPeriodSelect', {
        bindings: {
            validationTrigger: '<',
            onSelectPeriodFromCallback: '&?',
            onSelectPeriodToCallback : '&?',
            formName: '@',
        },
        templateUrl: 'modules/templates/bhFiscalPeriodSelect.tmpl.html',
        controller: FiscalPeriodSelect,
    });

FiscalPeriodSelect.$inject = ['FiscalService', 'FisaclPeriodService'];

function FiscalPeriodSelect(Fiscals, Periods) {
    var $ctrl = this;

    // If there is no name provided by default, a default name will be provided
    $ctrl.formName = $ctrl.formName || 'FiscalPeriodSelectForm';

    Fiscals.read()
        .then(function (fiscals) {
            $ctrl.fiscals = fiscals;
        });       

    $ctrl.loadPeriod = function (fiscal_id) {
        Periods.read(null, { fiscal_year_id : fiscal_id,  excludeExtremityPeriod : true })
            .then(function (periods) {
                $ctrl.periods = periods;
            });
    }

    $ctrl.onSelectPeriodFrom = function onSelect (selectedItem){
        $ctrl.onSelectPeriodFromCallback({ period : selectedItem });
    }

    $ctrl.onSelectPeriodTo = function onSelect (selectedItem){
        $ctrl.onSelectPeriodToCallback({ period : selectedItem });
    }

}