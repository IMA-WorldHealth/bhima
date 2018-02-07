angular.module('bhima.controllers')
  .controller('AccountConfigModalController', AccountConfigModalController);

AccountConfigModalController.$inject = [
  '$state', 'ConfigurationAccountService', 'ModalService', 'NotifyService', 'appcache',
];

function AccountConfigModalController($state, Config, ModalService, Notify, AppCache) {
  var vm = this;
  vm.accountConfig = {};

  var cache = AppCache('RubricModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = cache.stateParams = $state.params;
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
      .then(function (accountConfig) {    
        vm.accountConfig = accountConfig;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(accountConfigForm) {
    var promise;

    if (accountConfigForm.$invalid || accountConfigForm.$pristine) { return 0; }

    promise = (vm.isCreating) ?
      Config.create(vm.accountConfig) :
      Config.update(vm.accountConfig.id, vm.accountConfig);

    return promise
      .then(function () {
        var translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('configurationAccount', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('configurationAccount');
  }
}