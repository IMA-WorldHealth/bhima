angular.module('bhima.controllers')
  .controller('WeekendModalController', WeekendModalController);

WeekendModalController.$inject = [
  '$state', 'ConfigurationWeekendService', 'NotifyService', 'appcache', 'bhConstants',
];

function WeekendModalController($state, Config, Notify, AppCache, bhConstants) {
  const vm = this;
  vm.weekend = {};
  vm.weekend.daysChecked = {};

  const cache = AppCache('WeekendModal');

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
  vm.weekDays = bhConstants.weekDays;

  if (!vm.isCreateState) {
    vm.weekDays.forEach(days => {
      days.checked = false;
    });

    Config.read(vm.stateParams.id)
      .then((weekend) => {
        vm.weekend = weekend;
      })
      .catch(Notify.handleError);

    Config.getWeekDays(vm.stateParams.id)
      .then((daysConfig) => {
        daysConfig.forEach(object => {
          vm.weekDays.forEach(days => {
            if (days.id === object.indice) { days.checked = true; }
          });
        });
      })
      .catch(Notify.handleError);

  }

  // submit the data to the server from all two forms (update, create)
  function submit(WeekendForm) {
    if (WeekendForm.$invalid || WeekendForm.$pristine) { return 0; }

    vm.weekend.daysChecked = vm.weekDays
      .filter(days => days.checked)
      .map(days => days.id);

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
