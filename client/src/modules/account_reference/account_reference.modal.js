angular.module('bhima.controllers')
  .controller('AccountReferenceModalController', AccountReferenceModalController);

AccountReferenceModalController.$inject = [
  '$state', 'AccountService', 'AccountReferenceService',
  'NotifyService', 'appcache',
];

function AccountReferenceModalController($state, Accounts, AccountReferences, Notify, AppCache) {
  const vm = this;
  const cache = AppCache('AccountReferenceModal');

  vm.accountReference = {};
  vm.stateParams = {};

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if ($state.params.creating || $state.params.id) {
    cache.stateParams = $state.params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  if (!vm.isCreating) {
    AccountReferences.read(vm.stateParams.id)
      .then(reference => {
        vm.accountReference = reference;
      })
      .catch(Notify.handleError);
  } else {
    vm.accountReference.accounts = [];
    vm.accountReference.accountsException = [];
  }

  // load accounts
  Accounts.read(null, { locked : 0, hidden : 0 })
    .then(elements => {
      vm.accounts = Accounts.order(elements);
    })
    .catch(Notify.handleError);

  // load accounts references
  AccountReferences.read()
    .then(references => {
      vm.references = references;
    })
    .catch(Notify.handleError);

  // submit the data to the server from all two forms (update, create)
  function submit(accountReferenceForm) {
    if (accountReferenceForm.$invalid) { return null; }
    if (!accountReferenceForm.$dirty) { return null; }

    const promise = (vm.isCreating) ?
      AccountReferences.create(vm.accountReference) :
      AccountReferences.update(vm.accountReference.id, vm.accountReference);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'ACCOUNT.REFERENCE.CREATED' : 'ACCOUNT.REFERENCE.UPDATED';
        Notify.success(translateKey);
        $state.go('account_reference.list', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.transitionTo('account_reference.list');
  }
}

