angular.module('bhima.controllers')
  .controller('WeekEndModalController', WeekEndModalController);

WeekEndModalController.$inject = [
  '$state', 'ConfigurationWeekEndService', 'NotifyService', 'appcache',
];

function WeekEndModalController($state, Config, Notify, AppCache) {
  var vm = this;
  vm.weekend = {};

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
    Config.read(vm.stateParams.id)
      .then(function (weekConfig) {    
        vm.weekend = weekConfig;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(WeekEndForm) {
    var promise;

    if (WeekEndForm.$invalid || WeekEndForm.$pristine) { return 0; }

    promise = (vm.isCreating) ?
      Config.create(vm.weekend) :
      Config.update(vm.weekend.id, vm.weekend);

    return promise
      .then(function () {
        var translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('configurationWeekEnd', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('configurationWeekEnd');
  }
}