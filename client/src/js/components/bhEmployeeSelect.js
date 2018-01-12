angular.module('bhima.components')
  .component('bhEmployeeSelect', {
    templateUrl : 'modules/templates/bhEmployeeSelect.tmpl.html',
    controller  : EmployeeSelectController,
    transclude  : true,
    bindings    : {
      employeeId           : '<',
      disable          : '<?',
      onSelectCallback : '&',
      name             : '@?',
      required         : '<?',      
    },
  });

EmployeeSelectController.$inject = [
  'EmployeeService'
];

/**
 * Employee selection component
 *
 */
function EmployeeSelectController(Employees) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {    
    // fired when an employee has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'EmployeeForm';

    // load all Employee
    Employees.read()
      .then(function (employees) {
        $ctrl.employees = employees;
      });

    $ctrl.valid = true;

  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item, $model) {
    $ctrl.onSelectCallback({ employee : $item });
  };
}
