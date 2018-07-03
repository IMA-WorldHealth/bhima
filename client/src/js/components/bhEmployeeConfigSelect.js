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
      name             : '@?',
      validationTrigger :  '<?',
    },
  });

EmployeeConfigSelectController.$inject = [
  'ConfigurationEmployeeService', '$timeout', '$scope', 'NotifyService',
];

/**
 * Employee Configuration Select Controller
 */
function EmployeeConfigSelectController(EmployeeConfigs, $timeout, $scope, Notify) {
  const $ctrl = this;

  // fired at the beginning of the employee configuration select
  $ctrl.$onInit = function $onInit() {
    // translated label for the form input
    $ctrl.label = $ctrl.label || 'EMPLOYEE.CONFIGURATION';

    // default for form name
    $ctrl.name = $ctrl.name || 'EmployeeConfigForm';


    if (!angular.isDefined($ctrl.required)) {
      $ctrl.required = true;
    }

    EmployeeConfigs.read()
      .then(employeeConfigs => {
        $ctrl.employeeConfigLength = employeeConfigs.length;
        $ctrl.employeeConfigs = employeeConfigs;
      })
      .catch(Notify.handleError);

    // alias the name as EmployeeConfigForm
    $timeout(aliasComponentForm);
  };

  // this makes the HTML much more readable by reference EmployeeConfigForm instead of the name
  function aliasComponentForm() {
    $scope.EmployeeConfigForm = $scope[$ctrl.name];
  }

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function onSelect($item) {
    $ctrl.onSelectCallback({ employeeConfig : $item });

    // alias the EmployeeConfigForm name so that we can find it via filterFormElements
    $scope[$ctrl.name].$bhValue = $item.id;
  };
}
