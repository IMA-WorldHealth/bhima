angular.module('bhima.components')
  .component('bhFiscalYearPeriodSelect', {
    templateUrl : 'js/components/bhFiscalYearPeriodSelect/bhFiscalYearPeriodSelect.html',
    controller : FiscalYearPeriodSelect,
    transclude  : true,
    bindings : {
      onSelectCallback : '&',
      fiscalId : '<?',
      periodId : '<?',
    },
  });

FiscalYearPeriodSelect.$inject = ['FiscalService', 'PeriodApi', 'moment'];

function FiscalYearPeriodSelect(FiscalYears, Periods, moment) {
  const $ctrl = this;

  $ctrl.$onInit = () => {
    $ctrl.selected = {};

    FiscalYears.read()
      .then(years => {
        $ctrl.years = years;
      });

    Periods.read(null, { fiscal_year_id : $ctrl.fiscalId })
      .then(periods => {
        $ctrl.periods = periods.map(hrLabel).filter(p => p.number !== 0);
      });
  };

  $ctrl.onSelectFiscal = fiscal => {
    $ctrl.selected.fiscal = fiscal;

    Periods.read(null, { fiscal_year_id : $ctrl.fiscalId })
      .then(periods => {

        $ctrl.periods = periods.map(hrLabel).filter(p => p.start_date !== null && p.end_date !== null);
      });

    $ctrl.onSelectCallback({ selected : $ctrl.selected });
  };

  $ctrl.onSelectPeriod = period => {
    $ctrl.selected.period = period;
    $ctrl.onSelectCallback({ selected : $ctrl.selected });
  };

  function hrLabel(period) {
    period.hrLabel = moment(period.start_date).format('MMMM YYYY');
    return period;
  }
}
