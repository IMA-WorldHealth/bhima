angular.module('bhima.controllers')
  .controller('OffdayModalController', OffdayModalController);

OffdayModalController.$inject = [
  '$state', 'OffdayService', 'ModalService', 'NotifyService', 'appcache', 'moment',
];

function OffdayModalController($state, Offdays, ModalService, Notify, AppCache, moment) {
  var vm = this;
  vm.offday = {};

  var cache = AppCache('OffdayModal');

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
    Offdays.read(vm.stateParams.id)
      .then(function (offday) {
        offday.date = new Date(offday.date);
        vm.offday = offday;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(offdayForm) {
    var promise;

    if (offdayForm.$invalid) { return 0; }

    vm.offday.date = moment(vm.offday.date).format('YYYY-MM-DD');

    promise = (vm.isCreating) ?
      Offdays.create(vm.offday) :
      Offdays.update(vm.offday.id, vm.offday);

    return promise
      .then(function () {
        var translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('offdays', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('offdays');
  }
}