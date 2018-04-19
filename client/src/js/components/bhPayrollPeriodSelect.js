angular.module('bhima.components')
  .component('bhPayrollPeriodSelect', {
    templateUrl : 'modules/templates/bhPayrollPeriodSelect.tmpl.html',
    controller  : PayrollPeriodSelectController,
    transclude  : true,
    bindings    : {
      payrollConfigurationId : '<',
      onSelectCallback : '&',
      required         : '<?',
      label            : '@?',
      name             : '@?',
      validationTrigger :  '<?',
    },
  });

PayrollPeriodSelectController.$inject = [
  'PayrollConfigurationService', '$timeout', '$scope', 'NotifyService',
];

/**
 * Payroll Period Select Controller
 */
function PayrollPeriodSelectController(PayrollConfigs, $timeout, $scope, Notify) {
  let $ctrl = this;

  // fired at the beginning of the Payroll Configuration select
  $ctrl.$onInit = function $onInit() {
    // translated label for the form input
    $ctrl.label = $ctrl.label || 'FORM.LABELS.PERIOD_PAYMENT';

    // fired when an Payroll Period configuration has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'PayrollPeriodForm';

    if (!angular.isDefined($ctrl.required)) {
      $ctrl.required = true;
    }

    PayrollConfigs.read()
      .then(payrollConfigs => {
        $ctrl.payrollConfigs = payrollConfigs;
      })
      .catch(Notify.handleError);

    // alias the name as PayrollPeriodForm
    $timeout(aliasComponentForm);
  };

  // this makes the HTML much more readable by reference PayrollPeriodForm instead of the name
  function aliasComponentForm() {
    $scope.PayrollPeriodForm = $scope[$ctrl.name];
  }

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function onSelect($item) {
    $ctrl.onSelectCallback({ payrollConfig : $item });

    // alias the PayrollPeriodForm name so that we can find it via filterFormElements
    $scope[$ctrl.name].$bhValue = $item.id;
  };
}
