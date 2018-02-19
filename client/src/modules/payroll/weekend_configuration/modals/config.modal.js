angular.module('bhima.controllers')
  .controller('WeekEndConfigModalController', WeekEndConfigModalController);

WeekEndConfigModalController.$inject = [
  '$state', 'ConfigurationWeekEndService', 'NotifyService', 'appcache', 'bhConstants',
];

function WeekEndConfigModalController($state, Config, Notify, AppCache, bhConstants) {
  var vm = this;
  vm.weekend = {};

  var cache = AppCache('RubricModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  vm.weekDays = bhConstants.weekDays;

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if (!vm.isCreating) {
    Config.read(vm.stateParams.id)
      .then(function (weekend) {
        vm.weekend = weekend;
      })
      .catch(Notify.handleError);
  }

  Config.getWeekDays(vm.stateParams.id)
    .then(function (daysConfig) {
      daysConfig.forEach(object => {
        vm.weekDays.forEach(days => {
          if (days.id === object.indice) { days.checked = true; }
        });
      });
    })
    .catch(Notify.handleError);

  // submit the data to the server for configure week day
  function submit(accountForm) {
    var promise,
      daysChecked;

    if (accountForm.$invalid || accountForm.$pristine) { return 0; }

    daysChecked = vm.weekDays.filter(days => days.checked )
      .map(days => days.id );
   
    return Config.setWeekDays(vm.stateParams.id, daysChecked)
      .then(function () {
        Notify.success('FORM.INFO.UPDATE_SUCCESS');
        $state.go('configurationWeekEnd', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('configurationWeekEnd');
  }
}
