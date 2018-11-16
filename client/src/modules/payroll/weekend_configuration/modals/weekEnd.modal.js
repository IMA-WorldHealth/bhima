angular.module('bhima.controllers')
  .controller('WeekendModalController', WeekendModalController);

WeekendModalController.$inject = [
  '$state', 'ConfigurationWeekendService', 'NotifyService', 'appcache',
];

function WeekendModalController($state, Config, Notify, AppCache) {
  const vm = this;
  vm.weekend = {};

  const cache = AppCache('RubricModal');

  if ($state.params.creating || $state.params.id) {
    cache.stateParams = $state.params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }

  vm.isCreateState = vm.stateParams.creating;

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if (!vm.isCreateState) {
    Config.read(vm.stateParams.id)
      .then((weekConfig) => {
        vm.weekend = weekConfig;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(WeekendForm) {
    if (WeekendForm.$invalid || WeekendForm.$pristine) { return 0; }

    const promise = (vm.isCreateState)
      ? Config.create(vm.weekend)
      : Config.update(vm.weekend.id, vm.weekend);

    return promise
      .then(() => {
        const translateKey = (vm.isCreateState) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('configurationWeekend', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('configurationWeekend');
  }
}
