angular.module('bhima.controllers')
  .controller('BreakEvenReferenceModalController', BreakEvenReferenceModalController);

BreakEvenReferenceModalController.$inject = [
  '$state', 'BreakEvenReferenceService', 'NotifyService', 'appcache',
];

/**
 * Break Even Reference Modal Controller
 */

function BreakEvenReferenceModalController($state, BreakEvenReference, Notify, AppCache) {
  const vm = this;
  const cache = AppCache('AccountReferenceModal');

  vm.breakEvenReferences = {};
  vm.stateParams = {};

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;
  vm.onSelectAccountReference = onSelectAccountReference;

  if ($state.params.creating || $state.params.id) {
    cache.stateParams = $state.params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  if (!vm.isCreating) {
    BreakEvenReference.read(vm.stateParams.id)
      .then(data => {
        vm.breakEvenReferences = data;
      })
      .catch(Notify.handleError);
  }

  // load Break Even Reference
  BreakEvenReference.read()
    .then(BreakEvenReferences => {
      vm.BreakEvenReferences = BreakEvenReferences;
    })
    .catch(Notify.handleError);

  function onSelectAccountReference(accountReference) {
    vm.breakEvenReferences.account_reference_id = accountReference.id;
  }

  // submit the data to the server from all two forms (update, create)
  function submit(breakEvenReferenceForm) {
    if (breakEvenReferenceForm.$invalid) { return null; }
    if (!breakEvenReferenceForm.$dirty) { return null; }

    if (!vm.breakEvenReferences.is_cost) {
      vm.breakEvenReferences.is_variable = null;
    }

    if (vm.breakEvenReferences.is_cost) {
      vm.breakEvenReferences.is_turnover = null;
    }

    const promise = (vm.isCreating)
      ? BreakEvenReference.create(vm.breakEvenReferences)
      : BreakEvenReference.update(vm.breakEvenReferences.id, vm.breakEvenReferences);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('break_even_reference', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.transitionTo('break_even_reference');
  }
}
