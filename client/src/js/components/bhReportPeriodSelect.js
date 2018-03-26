angular.module('bhima.components')
  .component('bhReportPeriodSelect', {
    templateUrl : 'modules/templates/bhReportPeriodSelect.tmpl.html',
    controller  : ReportPeriodSelectController,
    // transclude  : true,
    bindings    : {
      periodId          : '<',
      disable           : '<?',
      onSelectCallback  : '&',
      name              : '@?',
      label             : '@?',
      required          : '<?',
      validationTrigger : '<',
    },
  });

ReportPeriodSelectController.$inject = [
  'FiscalPeriodService', '$filter',
];

/**
 * Fiscal Year Period selection component
 *
 */
function ReportPeriodSelectController(FiscalPeriod, $filter) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // fired when a Period has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'PeriodForm';

    // translated label for the form input
    $ctrl.label = $ctrl.label || 'FORM.LABELS.PERIODES';

    // load all Fiscal Yeal Period
    FiscalPeriod.read(null, { excludeExtremityPeriod : true })
      .then(periodes => {
        periodes.forEach(period => {
          period.monthYear = $filter('date')(period.end_date, 'MMMM yyyy');
        });

        $ctrl.periodes = periodes;
      });

    $ctrl.valid = true;
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = period => $ctrl.onSelectCallback({ period });
}
