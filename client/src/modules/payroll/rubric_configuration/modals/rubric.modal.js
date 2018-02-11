angular.module('bhima.controllers')
  .controller('ConfigModalController', ConfigModalController);

ConfigModalController.$inject = [
  '$state', 'ConfigurationService', 'ModalService', 'NotifyService', 'appcache',
];

function ConfigModalController($state, Configs, ModalService, Notify, AppCache) {
  var vm = this;
  vm.rubric = {};

  var cache = AppCache('RubricModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if (!vm.isCreating) {
    Configs.read(vm.stateParams.id)
      .then(function (rubric) {
        vm.rubric = rubric;

        vm.setting = true;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(rubricForm) {
    var promise;

    if (rubricForm.$invalid || rubricForm.$pristine) { return 0; }

    promise = (vm.isCreating) ?
      Configs.create(vm.rubric) :
      Configs.update(vm.rubric.id, vm.rubric);

    return promise
      .then(function () {
        var translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('configurationRubric', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('configurationRubric');
  }
}