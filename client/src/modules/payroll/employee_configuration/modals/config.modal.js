angular.module('bhima.controllers')
  .controller('EmployeeConfigModalController', EmployeeConfigModalController);

EmployeeConfigModalController.$inject = [
  '$state', 'ConfigurationEmployeeService', 'NotifyService', 'appcache', 'bhConstants', 'EmployeeService',
];

function EmployeeConfigModalController($state, Config, Notify, AppCache, bhConstants, Employees) {
  const vm = this;
  vm.config = {};

  const cache = AppCache('EmployeeModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = $state.params;
    cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }

  vm.isCreating = vm.stateParams.creating;

  vm.onChangeRoleSelection = onChangeRoleSelection;

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if (!vm.isCreating) {
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
    })
    .catch(Notify.handleError);

  // submit the data to the server for configure week day
  function submit() {
    // no changes have occured, just close the modal.
    if (!vm.checked || !vm.checked.length) { return closeModal(); }

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
