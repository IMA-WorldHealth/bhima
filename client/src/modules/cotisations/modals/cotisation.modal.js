angular.module('bhima.controllers')
  .controller('CotisationModalController', CotisationModalController);

CotisationModalController.$inject = [
  '$state', 'CotisationService', 'ModalService', 'NotifyService', 'appcache',
];

function CotisationModalController($state, Cotisations, ModalService, Notify, AppCache) {
  var vm = this;
  vm.cotisation = {};

  var cache = AppCache('CotisationModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  vm.selectAccountFour = function selectAccountFour(account) {
    vm.cotisation.four_account_id = account.id;
  };

  vm.selectAccountSix = function selectAccountSix(account) {
    vm.cotisation.six_account_id = account.id;
  };

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if (!vm.isCreating) {
    Cotisations.read(vm.stateParams.id)
      .then(function (cotisation) {
        vm.cotisation = cotisation;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(cotisationForm) {
    var promise;

    if (cotisationForm.$invalid || cotisationForm.$pristine) { return 0; }

    promise = (vm.isCreating) ?
      Cotisations.create(vm.cotisation) :
      Cotisations.update(vm.cotisation.id, vm.cotisation);

    return promise
      .then(function () {
        var translateKey = (vm.isCreating) ? 'COTISATION.CREATED' : 'COTISATION.UPDATED';
        Notify.success(translateKey);
        $state.go('cotisations', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('cotisations');
  }
}