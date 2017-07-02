angular.module('bhima.components')
    .component('bhFiscalPeriodSelect', {
        bindings: {
            validationTrigger: '<',
            onSelectPeriodFromCallback: '&?',
            onSelectPeriodToCallback: '&?',
            formName: '@',
        },
        templateUrl: 'modules/templates/bhFiscalPeriodSelect.tmpl.html',
        controller: FiscalPeriodSelect,
    });

FiscalPeriodSelect.$inject = ['FiscalService', 'FisaclPeriodService', '$translate'];

function FiscalPeriodSelect(Fiscals, Periods, $translate) {
    var $ctrl = this;
    var monthMap = {
        1: 'FORM.LABELS.JANUARY',
        2: 'FORM.LABELS.FEBRUARY',
        3: 'FORM.LABELS.MARCH',
        4: 'FORM.LABELS.APRIL',
        5: 'FORM.LABELS.MAY',
        6: 'FORM.LABELS.JUNE',
        7: 'FORM.LABELS.JULY',
        8: 'FORM.LABELS.AUGUST',
        9: 'FORM.LABELS.SEPTEMBER',
        10: 'FORM.LABELS.OCTOBER',
        11: 'FORM.LABELS.NOVEMBER',
        12: 'FORM.LABELS.DECEMBER'
    };

    // If there is no name provided by default, a default name will be provided
    $ctrl.formName = $ctrl.formName || 'FiscalPeriodSelectForm';

    Fiscals.read()
        .then(function (fiscals) {
            $ctrl.fiscals = fiscals;
        });

    $ctrl.loadPeriod = function (fiscal_id) {         
        Periods.read(null, { fiscal_year_id: fiscal_id, excludeExtremityPeriod: true })
            .then(function (periods) {
                periods.forEach(function (period) {
                    if (period.number >= 1 && period.number <= 12) {
                        period.hrLabel = $translate.instant(monthMap[period.month_number]);
                        period.hrLabel = [period.hrLabel, period.year_number].join(' ');

                    }else{
                        period.hrLabel = period.label;
                    }
                });
                $ctrl.periods = periods;
            });
    }

    $ctrl.onSelectPeriodFrom = function onSelect(selectedItem) {
        $ctrl.onSelectPeriodFromCallback({ period: selectedItem });
    }

    $ctrl.onSelectPeriodTo = function onSelect(selectedItem) {
        $ctrl.onSelectPeriodToCallback({ period: selectedItem });
    }

}