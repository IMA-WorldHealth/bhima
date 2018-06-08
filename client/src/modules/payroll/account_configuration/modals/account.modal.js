angular.module('bhima.controllers')
  .controller('AccountConfigModalController', AccountConfigModalController);

AccountConfigModalController.$inject = [
  '$state', 'ConfigurationAccountService', 'NotifyService', 'appcache',
];

function AccountConfigModalController($state, Config, Notify, AppCache) {
  const vm = this;
  vm.accountConfig = {};

  const cache = AppCache('RubricModal');

  if ($state.params.creating || $state.params.id) {
    cache.stateParams = $state.params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  vm.selectAccount = function selectAccount(account) {
    vm.accountConfig.account_id = account.id;
  };

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if (!vm.isCreating) {
    Config.read(vm.stateParams.id)
      .then(accountConfig => {
        vm.accountConfig = accountConfig;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(accountConfigForm) {
    if (accountConfigForm.$invalid || accountConfigForm.$pristine) { return 0; }

    const promise = (vm.isCreating) ?
      Config.create(vm.accountConfig) :
      Config.update(vm.accountConfig.id, vm.accountConfig);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('configurationAccount', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('configurationAccount');
  }
}
