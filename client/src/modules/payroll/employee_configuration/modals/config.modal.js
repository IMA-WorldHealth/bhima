angular.module('bhima.controllers')
  .controller('EmployeeConfigModalController', EmployeeConfigModalController);

EmployeeConfigModalController.$inject = [
  '$state', 'ConfigurationEmployeeService', 'NotifyService', 'appcache', 'bhConstants', 'EmployeeService', 'params',
];

function EmployeeConfigModalController($state, Config, Notify, AppCache, bhConstants, Employees, params) {
  const vm = this;
  vm.config = {};

  const cache = AppCache('EmployeeModal');

  if (params.isCreateState || params.id) {
    cache.stateParams = params;
  }

  vm.stateParams = cache.stateParams;
  vm.isCreateState = vm.stateParams.isCreateState;

  vm.onChangeRoleSelection = onChangeRoleSelection;

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if (!vm.isCreateState) {
    Config.read(vm.stateParams.id)
      .then((config) => {
        vm.config = config;
      })
      .catch(Notify.handleError);
  }

  function onChangeRoleSelection(data) {
    vm.checked = data;
  }

  Employees.read()
    .then((employees) => {
      vm.employees = employees;
      return Config.getEmployeeConfiguration(vm.stateParams.id);
    })
    .then((employeeConfig) => {

      vm.checkedUuids = employeeConfig.map(row => row.employee_uuid);

      vm.disabledUuids = vm.employees
        .filter(row => row.locked)
        .map(row => row.uuid);

      // clone the original values as the new values.
      vm.checked = [...vm.checkedUuids];
    })
    .catch(Notify.handleError);

  // submit the data to the server for configure week day
  function submit() {
    return Config.setEmployees(vm.stateParams.id, vm.checked)
      .then(() => {
        Notify.success('FORM.INFO.UPDATE_SUCCESS');
        $state.go('configurationEmployee', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('configurationEmployee');
  }
}
