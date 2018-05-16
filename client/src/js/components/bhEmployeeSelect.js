angular.module('bhima.components')
  .component('bhEmployeeSelect', {
    templateUrl : 'modules/templates/bhEmployeeSelect.tmpl.html',
    controller  : EmployeeSelectController,
    transclude  : true,
    bindings    : {
      employeeUuid     : '<',
      disable          : '<?',
      onSelectCallback : '&',
      required         : '<?',
      validateTrigger  : '<?',    
    },
  });

EmployeeSelectController.$inject = [
  'EmployeeService', 'NotifyService',
];

/**
 * Employee selection component
 *
 */
function EmployeeSelectController(Employees, Notify) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {    
    // load all Employee
    Employees.read()
      .then(function (employees) {
        $ctrl.employees = employees;
      })
      .catch(Notify.handleError)
      .finally(function () {
        $ctrl.loading = false;
      });

    $ctrl.valid = true;
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item) {
    $ctrl.onSelectCallback({ employee : $item });
  };
}
