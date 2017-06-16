angular.module('bhima.components')
.component('bhFiscalPeriodSelect', {
    bindings : {
        validationTrigger : '<',
        onSelectCallback : '&',
        formName : '@',
    },
    templateUrl : 'modules/templates/bhFiscalPeriodSelect.tmpl.html',
    controller : FiscalPeriodSelect,
});

FiscalPeriodSelect.$inject = ['FiscalService', 'PeriodService'];

function FiscalPeriodSelect (Fiscals, Periods){
    var $ctrl = this;

    // If there is no name provided by default, a default name will be provided
    $ctrl.formName = $ctrl.formName || 'FiscalPeriodSelectForm';

    Fiscals.read()
    .then(function(fiscals){
        $ctrl.fiscals = fiscals;
    });

    $ctrl.loadPeriod = function (fiscals){
        Periods.read()
        .then(function(periods){
            $ctrl.periods = periods;
        });        
    }

}