angular.module('bhima.controllers')
  .controller('OffdayModalController', OffdayModalController);

OffdayModalController.$inject = [
  '$state', 'OffdayService', 'NotifyService', 'appcache', 'moment',
];

function OffdayModalController($state, Offdays, Notify, AppCache, moment, params) {
  const vm = this;
  vm.offday = {};

  const cache = AppCache('OffdayModal');

  if (params.isCreateState || params.id) {
    vm.stateParams = params;
    cache.stateParams = params;
  } else {
    vm.stateParams = cache.stateParams;
  }

  vm.isCreateState = vm.stateParams.isCreateState;

  // update the date
  vm.onDateChange = (date) => {
    vm.offday.date = date;
  };

  // exposed methods
  vm.submit = submit;

  if (!vm.isCreateState) {
    Offdays.read(vm.stateParams.id)
      .then((offday) => {
        offday.date = new Date(offday.date);
        vm.offday = offday;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(offdayForm) {
    if (offdayForm.$invalid) { return 0; }

    vm.offday.date = moment(vm.offday.date).format('YYYY-MM-DD');

    const promise = (vm.isCreateState)
      ? Offdays.create(vm.offday)
      : Offdays.update(vm.offday.id, vm.offday);

    return promise
      .then(() => {
        const translateKey = (vm.isCreateState) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('offdays', null, { reload : true });
      })
      .catch(Notify.handleError);
  }
}
