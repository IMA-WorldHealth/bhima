angular.module('bhima.controllers')
  .controller('AccountReferenceTypeModalController', AccountReferenceTypeModalController);

AccountReferenceTypeModalController.$inject = [
  '$state', 'AccountReferenceTypeService', 'NotifyService', 'appcache',
];

/**
 * Account Reference Type Modal Controller
 */

function AccountReferenceTypeModalController($state, AccountReferenceType, Notify, AppCache) {
  const vm = this;
  const cache = AppCache('AccountReferenceModal');

  vm.types = {};
  vm.stateParams = {};

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;
  vm.clear = clear;

  if ($state.params.creating || $state.params.id) {
    cache.stateParams = $state.params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  if (!vm.isCreating) {
    AccountReferenceType.read(vm.stateParams.id)
      .then(data => {
        vm.types = data;
      })
      .catch(Notify.handleError);
  }

  // load Account Reference Type
  AccountReferenceType.read()
    .then(ReferencesType => {
      vm.ReferencesType = ReferencesType;
    })
    .catch(Notify.handleError);

  // submit the data to the server from all two forms (update, create)
  function submit(accountReferenceTypeForm) {
    vm.hasNoChange = accountReferenceTypeForm.$submitted && accountReferenceTypeForm.$pristine && !vm.isCreating;

    if (accountReferenceTypeForm.$invalid || !accountReferenceTypeForm.$dirty) { return null; }

    const promise = (vm.isCreating)
      ? AccountReferenceType.create(vm.types)
      : AccountReferenceType.update(vm.types.id, vm.types);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('account_reference_type', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function clear(value) {
    vm.types[value] = null;
  }

  function closeModal() {
    $state.go('account_reference_type');
  }
}
