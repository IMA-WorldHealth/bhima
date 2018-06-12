angular.module('bhima.controllers')
  .controller('EmployeeConfigModalController', EmployeeConfigModalController);

EmployeeConfigModalController.$inject = [
  '$state', 'ConfigurationEmployeeService', 'NotifyService', 'appcache', 'bhConstants', 'EmployeeService',
];

function EmployeeConfigModalController($state, Config, Notify, AppCache, bhConstants, Employees) {
  var vm = this;
  vm.config = {};

  var cache = AppCache('EmployeeModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;
  vm.toggleAllEmployees = toggleAllEmployees;
  vm.all = false;

  if (!vm.isCreating) {
    Config.read(vm.stateParams.id)
      .then(function (config) {
        vm.config = config;
      })
      .catch(Notify.handleError);
  }

  Employees.read()
    .then(function (employees) {
      vm.employees = employees;

      return Config.getEmployees(vm.stateParams.id);
    })
    .then(function (employeeConfig) {

      employeeConfig.forEach(object => {
        vm.employees.forEach(employee => {
          if (employee.uuid === object.employee_uuid) { employee.checked = true; }
        });
      });
    })
    .catch(Notify.handleError);

  // toggles all Employees to match there Configuration Employee's setting
  function toggleAllEmployees(bool) {
    vm.employees.forEach(function (employee) {
      employee.checked = employee.locked ? null : bool;
    });
  }

  // submit the data to the server for configure week day
  function submit(employeeConfigForm) {
    var promise,
      employeesChecked;

    if (employeeConfigForm.$invalid || employeeConfigForm.$pristine) { return 0; }

    employeesChecked = vm.employees.filter(employee => employee.checked )
      .map(employee => employee.uuid );
   
    return Config.setEmployees(vm.stateParams.id, employeesChecked)
      .then(function () {
        Notify.success('FORM.INFO.UPDATE_SUCCESS');
        $state.go('configurationEmployee', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('configurationEmployee');
  }
}
