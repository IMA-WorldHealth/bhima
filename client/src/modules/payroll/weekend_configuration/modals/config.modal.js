angular.module('bhima.controllers')
  .controller('WeekendConfigModalController', WeekendConfigModalController);

WeekendConfigModalController.$inject = [
  '$state', 'ConfigurationWeekendService', 'NotifyService', 'appcache', 'bhConstants',
];

function WeekendConfigModalController($state, Config, Notify, AppCache, bhConstants) {
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

  vm.weekDays = bhConstants.weekDays;

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if (!vm.isCreateState) {
    Config.read(vm.stateParams.id)
      .then((weekend) => {
        vm.weekend = weekend;
      })
      .catch(Notify.handleError);
  }

  Config.getWeekDays(vm.stateParams.id)
    .then((daysConfig) => {
      daysConfig.forEach(object => {
        vm.weekDays.forEach(days => {
          if (days.id === object.indice) { days.checked = true; }
        });
      });
    })
    .catch(Notify.handleError);

  // submit the data to the server for configure week day
  function submit(accountForm) {
    if (accountForm.$invalid || accountForm.$pristine) { return 0; }

    const daysChecked = vm.weekDays
      .filter(days => days.checked)
      .map(days => days.id);

    return Config.setWeekDays(vm.stateParams.id, daysChecked)
      .then(() => {
        Notify.success('FORM.INFO.UPDATE_SUCCESS');
        $state.go('configurationWeekend', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('configurationWeekend');
  }
}
