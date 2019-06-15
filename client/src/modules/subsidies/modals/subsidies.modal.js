angular.module('bhima.controllers')
  .controller('SubsidyModalController', SubsidyModalController);

SubsidyModalController.$inject = [
  '$state', 'SubsidyService', 'NotifyService',
];

function SubsidyModalController($state, Subsidy, Notify) {
  const vm = this;

  vm.identifier = $state.params.id;
  vm.isCreating = !!($state.params.creating);

  // exposed methods
  vm.submit = submit;
  vm.onAccountSelect = onAccountSelect;

  function onAccountSelect(account) {
    vm.subsidy.account_id = account.id;
  }

  function startup() {
    if (!vm.isCreating) {
      Subsidy.read(vm.identifier)
        .then(subsidy => {
          vm.subsidy = subsidy;
        })
        .catch(Notify.handleError);
    } else {
      vm.subsidy = {};
    }
  }

  // submit the data to the server from all two forms (update, create)
  function submit(subsidyForm) {
    if (subsidyForm.$invalid) {
      return;
    }

    if (subsidyForm.$pristine) {
      cancel();
      return;
    }

    const subsidy = angular.copy(vm.subsidy);
    const promise = (vm.isCreating)
      ? Subsidy.create(subsidy)
      : Subsidy.update(subsidy.id, subsidy);

    promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'SUBSIDY.CREATED' : 'SUBSIDY.UPDATED';
        Notify.success(translateKey);
        $state.go('subsidies', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function cancel() {
    $state.go('subsidies');
  }

  startup();
}
