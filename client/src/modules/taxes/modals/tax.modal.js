angular.module('bhima.controllers')
  .controller('TaxModalController', TaxModalController);

TaxModalController.$inject = [
  '$state', 'TaxService', 'ModalService', 'NotifyService', 'appcache',
];

function TaxModalController($state, Taxes, ModalService, Notify, AppCache) {
  var vm = this;
  vm.tax = {};

  var cache = AppCache('TaxModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  vm.selectAccountFour = function selectAccountFour(account) {
    vm.tax.four_account_id = account.id;
  };

  vm.selectAccountSix = function selectAccountSix(account) {
    vm.tax.six_account_id = account.id;
  };

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if (!vm.isCreating) {
    Taxes.read(vm.stateParams.id)
      .then(function (tax) {
        vm.tax = tax;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(taxForm) {
    var promise;

    if (taxForm.$invalid || taxForm.$pristine) { return 0; }

    promise = (vm.isCreating) ?
      Taxes.create(vm.tax) :
      Taxes.update(vm.tax.id, vm.tax);

    return promise
      .then(function () {
        var translateKey = (vm.isCreating) ? 'TAX.CREATED' : 'TAX.UPDATED';
        Notify.success(translateKey);
        $state.go('taxes', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('taxes');
  }
}