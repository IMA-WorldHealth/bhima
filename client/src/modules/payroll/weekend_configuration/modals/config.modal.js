angular.module('bhima.controllers')
  .controller('WeekEndConfigModalController', WeekEndConfigModalController);

WeekEndConfigModalController.$inject = [
  '$state', 'ConfigurationWeekEndService', 'NotifyService', 'appcache',
];

function WeekEndConfigModalController($state, Config, Notify, AppCache) {
  var vm = this;
  vm.weekend = {};

  var cache = AppCache('RubricModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  vm.weekDays = [
    {
      id : 0,
      label : 'FORM.LABELS.WEEK_DAYS.SUNDAY',
    },
    {
      id : 1,
      label : 'FORM.LABELS.WEEK_DAYS.MONDAY',
    },
    {
      id : 2,
      label : 'FORM.LABELS.WEEK_DAYS.TUESDAY',
    },
    {
      id : 3,
      label : 'FORM.LABELS.WEEK_DAYS.WEDNESDAY',
    },
    {
      id : 4,
      label : 'FORM.LABELS.WEEK_DAYS.THURSDAY',
    },
    {
      id : 5,
      label : 'FORM.LABELS.WEEK_DAYS.FRIDAY',
    },
    {
      id : 6,
      label : 'FORM.LABELS.WEEK_DAYS.SATURDAY',
    },
  ];

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
      daysConfig.forEach(function (object) {
        vm.weekDays.forEach(function (days) {
          if (days.id === object.indice) {
            days.checked = true;
          }
        });
      });
    })
    .catch(Notify.handleError);

  // submit the data to the server for configure week day
  function submit(accountForm) {
    var promise,
      daysChecked;

    if (accountForm.$invalid || accountForm.$pristine) { return 0; }

    daysChecked = vm.weekDays.filter(function (days) {
      return days.checked;
    })
      .map(function (days) {
        return days.id;
      });

    return Config.setWeekDays(vm.stateParams.id, daysChecked)
      .then(function () {
        Notify.success('FORM.INFO.UPDATE_SUCCESS');
        $state.go('configurationWeekEnd', null, { reload : true });
      })
      .catch(Notify.handleError);



    // promise = (vm.isCreating) ?
    //   Config.create(vm.weekend) :
    //   Config.update(vm.weekend.id, vm.weekend);

    // return promise
    //   .then(function () {
    //     var translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
    //     Notify.success(translateKey);
    //     $state.go('configurationWeekEnd', null, { reload : true });
    //   })
    //   .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('configurationWeekEnd');
  }
}
