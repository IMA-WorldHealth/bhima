angular.module('bhima.controllers')
  .controller('EmployeeModalController', EmployeeModalController);

EmployeeModalController.$inject = [
  '$state', 'ConfigurationEmployeeService', 'NotifyService', 'appcache',
];

function EmployeeModalController($state, Config, Notify, AppCache) {
  const vm = this;
  vm.employee = {};

  const cache = AppCache('EmployeeModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = $state.params;
    cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if (!vm.isCreating) {
    Config.read(vm.stateParams.id)
      .then((employee) => {
        vm.employee = employee;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(EmployeeForm) {
    if (EmployeeForm.$invalid || EmployeeForm.$pristine) { return 0; }

    const promise = (vm.isCreating) ?
      Config.create(vm.employee) :
      Config.update(vm.employee.id, vm.employee);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('configurationEmployee', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('configurationEmployee');
  }
}
