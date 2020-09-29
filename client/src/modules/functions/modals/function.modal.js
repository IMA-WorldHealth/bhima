angular.module('bhima.controllers')
  .controller('FunctionModalController', FunctionModalController);

FunctionModalController.$inject = [
  '$state', 'FunctionService', 'NotifyService', 'appcache', 'params',
];

function FunctionModalController($state, Functions, Notify, AppCache, params) {
  const vm = this;

  const cache = AppCache('FunctionModal');

  if (params.isCreateState || params.id) {
    cache.stateParams = params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }

  vm.isCreateState = vm.stateParams.isCreateState;

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if (!vm.isCreateState) {
    Functions.read(vm.stateParams.id)
      .then(data => {
        vm.function = data;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(functionForm) {

    if (functionForm.$invalid || functionForm.$pristine) { return 0; }

    const promise = (vm.isCreateState)
      ? Functions.create(vm.function)
      : Functions.update(vm.function.id, vm.function);

    return promise
      .then(() => {
        const translateKey = (vm.isCreateState) ? 'PROFESSION.CREATED' : 'PROFESSION.UPDATED';
        Notify.success(translateKey);
        $state.go('functions', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('functions');
  }
}
