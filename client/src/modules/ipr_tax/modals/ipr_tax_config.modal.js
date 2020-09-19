angular.module('bhima.controllers')
  .controller('IprTaxConfigModalController', IprTaxConfigModalController);

IprTaxConfigModalController.$inject = [
  '$state', 'IprTaxService', 'IprTaxConfigService', 'NotifyService', 'appcache', 'params',
];

function IprTaxConfigModalController($state, IprTax, IprConfig, Notify, AppCache, params) {
  const vm = this;
  vm.iprTax = {};

  const cache = AppCache('IprTaxConfigModal');

  if (params.isCreateState || params.id) {
    vm.stateParams = params;
    cache.stateParams = params;
  } else {
    vm.stateParams = cache.stateParams;
  }

  vm.isCreateState = vm.stateParams.isCreateState;

  // exposed methods
  vm.submit = submit;

  if (vm.stateParams.taxIprId) {
    IprTax.read(vm.stateParams.taxIprId)
      .then((iprTax) => {
        iprTax.taxe_ipr_id = iprTax.id;
        delete iprTax.id;

        vm.iprTax = iprTax;
      })
      .catch(Notify.handleError);

    IprConfig.read(null, { taxe_ipr_id : vm.taxIprId })
      .then((iprConfig) => {
        vm.iprConfig = iprConfig;
      })
      .catch(Notify.handleError);
  }

  if (!vm.isCreateState) {
    IprConfig.read(vm.stateParams.id)
      .then((iprTax) => {
        vm.iprTax = iprTax;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(iprTaxForm) {

    if (iprTaxForm.$invalid) { return 0; }
    const iprConfigData = IprConfig.configData(vm.iprTax, vm.iprConfig);

    const promise = (vm.isCreateState) ? IprConfig.create(iprConfigData)
      : IprConfig.update(vm.iprTax.id, iprConfigData);

    return promise
      .then(() => {
        const translateKey = (vm.isCreateState) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('iprConfiguration', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

}
