angular.module('bhima.controllers')
  .controller('IprTaxModalController', IprTaxModalController);

IprTaxModalController.$inject = [
  '$state', 'IprTaxService', 'NotifyService', 'appcache', 'moment',
];

function IprTaxModalController($state, IprTaxes, Notify, AppCache, moment) {
  var vm = this;
  vm.iprTax = {};

  var cache = AppCache('IprTaxModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }

  vm.isCreating = vm.stateParams.creating;

  // exposed methods
  vm.submit = submit;

  if (!vm.isCreating) {
    IprTaxes.read(vm.stateParams.id)
      .then(function (iprTax) {
        vm.iprTax = iprTax;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(iprTaxForm) {
    var promise;
    if (iprTaxForm.$invalid) { return 0; }
    
    delete vm.iprTax.symbol;

    promise = (vm.isCreating) ?
      IprTaxes.create(vm.iprTax) :
      IprTaxes.update(vm.iprTax.id, vm.iprTax);

    return promise
      .then(function () {
        var translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('ipr_tax', null, { reload : true });
      })
      .catch(Notify.handleError);
  }
}