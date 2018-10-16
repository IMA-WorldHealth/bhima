angular.module('bhima.components')
  .component('bhEmployeeConfigSelect', {
    templateUrl : 'modules/templates/bhEmployeeConfigSelect.tmpl.html',
    controller  : EmployeeConfigSelectController,
    transclude  : true,
    bindings    : {
      configEmployeeId : '<',
      onSelectCallback : '&',
      required         : '<?',
      label            : '@?',
    },
  });

EmployeeConfigSelectController.$inject = [
  'ConfigurationEmployeeService', 'NotifyService',
];

/**
 * Employee Configuration Select Controller
 */
function EmployeeConfigSelectController(EmployeeConfigs, Notify) {
  const $ctrl = this;

  // fired at the beginning of the employee configuration select
  $ctrl.$onInit = function $onInit() {
    // translated label for the form input
    $ctrl.label = $ctrl.label || 'EMPLOYEE.CONFIGURATION';

    if (!angular.isDefined($ctrl.required)) {
      $ctrl.required = true;
    }

    EmployeeConfigs.read()
      .then(employeeConfigs => {
        $ctrl.employeeConfigs = employeeConfigs;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = employeeConfig => {
    $ctrl.onSelectCallback({ employeeConfig });
  };
}
