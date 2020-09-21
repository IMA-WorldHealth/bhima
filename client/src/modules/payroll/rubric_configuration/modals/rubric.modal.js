angular.module('bhima.controllers')
  .controller('ConfigModalController', ConfigModalController);

ConfigModalController.$inject = [
  '$state', 'ConfigurationService', 'ModalService', 'NotifyService', 'appcache', 'params',
];

function ConfigModalController($state, Configs, ModalService, Notify, AppCache, params) {
  const vm = this;
  vm.rubric = {};

  const cache = AppCache('RubricModal');

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
    Configs.read(vm.stateParams.id)
      .then((rubric) => {
        vm.rubric = rubric;
        vm.setting = true;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(rubricForm) {
    if (rubricForm.$invalid || rubricForm.$pristine) { return 0; }

    const promise = (vm.isCreateState)
      ? Configs.create(vm.rubric)
      : Configs.update(vm.rubric.id, vm.rubric);

    return promise
      .then(() => {
        const translateKey = (vm.isCreateState) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('configurationRubric', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('configurationRubric');
  }
}
