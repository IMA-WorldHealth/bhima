angular.module('bhima.controllers')
  .controller('IprTaxConfigModalController', IprTaxConfigModalController);

IprTaxConfigModalController.$inject = [
  '$state', 'IprTaxService', 'IprTaxConfigService', 'NotifyService', 'appcache', 'moment',
];

function IprTaxConfigModalController($state, IprTax, IprConfig, Notify, AppCache, moment) {
  var vm = this;
  vm.iprTax = {};

  var cache = AppCache('IprTaxConfigModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }

  vm.isCreating = vm.stateParams.creating;

  // exposed methods
  vm.submit = submit;

  if (vm.stateParams.taxIprId) {
    IprTax.read(vm.stateParams.taxIprId)
      .then(function (iprTax) {
        iprTax.taxe_ipr_id = iprTax.id; 
        delete iprTax.id;

        vm.iprTax = iprTax;
      })
      .catch(Notify.handleError);

    IprConfig.read(null, { taxe_ipr_id : vm.taxIprId })
      .then(function (iprConfig) {
        vm.iprConfig = iprConfig;
      })
      .catch(Notify.handleError);
  }

  if (!vm.isCreating) {
    IprConfig.read(vm.stateParams.id)
      .then(function (iprTax) {
        vm.iprTax = iprTax;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(iprTaxForm) {
    var promise;
    if (iprTaxForm.$invalid) { return 0; }
    var iprConfigData = IprConfig.configData(vm.iprTax, vm.iprConfig);

    promise = (vm.isCreating) ?
      IprConfig.create(iprConfigData) :
      IprConfig.update(vm.iprTax.id, iprConfigData);

    return promise
      .then(function () {
        var translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('configuration', null, { reload : true });
      })
      .catch(Notify.handleError);
  }
}
