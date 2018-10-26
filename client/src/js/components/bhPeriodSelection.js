angular.module('bhima.components')
  .component('bhPeriodSelection', {
    templateUrl : 'modules/templates/bhPeriodSelection.html',
    controller  : PeriodSelectionController,
    bindings    : {
      fiscalYearId : '<',
      onSelectCallback : '&',
      periodId : '<?',
      disable : '<?',
      label  : '@?',
    },
  });

PeriodSelectionController.$inject = [
  'FiscalService', 'moment',
];

/**
 * @function bhPeriodSelection
 *
 * @description
 * This component allows a user to select a period from a fiscal year.  The
 * opening balance period is not displayed.  One a period is selected, it is
 * returned via the onSelectCallback().
 */
function PeriodSelectionController(Fiscal, moment) {
  const $ctrl = this;

  $ctrl.$onInit = () => {
    $ctrl.label = $ctrl.label || 'FORM.LABELS.PERIOD';

    if ($ctrl.fiscalYearId) {
      loadPeriods($ctrl.fiscalYearId);
    }
  };

  // fired when the fiscal year component boundery changes
  $ctrl.$onChanges = (changes) => {
    const newFiscalValue = changes && changes.fiscalYearId && changes.fiscalYearId.currentValue;
    const previousFiscalValue = changes && changes.fiscalYearId && changes.fiscalYearId.previousValue;

    if (!angular.equals(newFiscalValue, previousFiscalValue)) {
      $ctrl.fiscalYearId = newFiscalValue;
      loadPeriods($ctrl.fiscalYearId);
    }
  };

  function loadPeriods(fiscalYearId) {
    Fiscal.getPeriods(fiscalYearId)
      .then(periods => {
        periods.forEach(period => {
          // add 2 days to make sure timezone is accounted for
          period.hrLabel = moment(period.start_date).add(2, 'days').format('MMMM YYYY');
        });

        $ctrl.periods = periods.filter(p => p.number !== 0);
      });
  }

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onChange = period => $ctrl.onSelectCallback({ period });
}
