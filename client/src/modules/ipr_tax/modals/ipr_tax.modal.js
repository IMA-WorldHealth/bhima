angular.module('bhima.controllers')
  .controller('IprTaxModalController', IprTaxModalController);

IprTaxModalController.$inject = [
  '$state', 'IprTaxService', 'NotifyService', 'appcache',
];

function IprTaxModalController($state, IprTaxes, Notify, AppCache) {
  const vm = this;
  vm.iprTax = {};

  const cache = AppCache('IprTaxModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = $state.params;
    cache.stateParams = $state.params;

  } else {
    vm.stateParams = cache.stateParams;
  }

  vm.isCreating = vm.stateParams.creating;

  // exposed methods
  vm.submit = submit;

  if (!vm.isCreating) {
    IprTaxes.read(vm.stateParams.id)
      .then((iprTax) => {
        vm.iprTax = iprTax;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(iprTaxForm) {

    if (iprTaxForm.$invalid) { return 0; }

    delete vm.iprTax.symbol;

    const promise = (vm.isCreating)
      ? IprTaxes.create(vm.iprTax)
      : IprTaxes.update(vm.iprTax.id, vm.iprTax);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('ipr_tax', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  vm.setCurrency = (currencyId) => {
    vm.iprTax.currency_id = currencyId;
  };

}
