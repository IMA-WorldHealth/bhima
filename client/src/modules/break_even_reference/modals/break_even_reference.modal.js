angular.module('bhima.controllers')
  .controller('BreakEvenReferenceModalController', BreakEvenReferenceModalController);

BreakEvenReferenceModalController.$inject = [
  '$state', 'BreakEvenReferenceService', 'NotifyService', 'appcache', 'params',
];

/**
 * Break Even Reference Modal Controller
 */
function BreakEvenReferenceModalController($state, BreakEvenReference, Notify, AppCache, params) {
  const vm = this;
  const cache = AppCache('BreakEvenReferenceModal');

  vm.reference = {};
  vm.stateParams = {};

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;
  vm.onSelectAccountReference = onSelectAccountReference;
  vm.setRevenueType = setRevenueType;
  vm.unsetRevenueType = unsetRevenueType;

  if (params.isCreateState || params.id) {
    cache.stateParams = params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }

  vm.isCreateState = params.isCreateState;

  if (!vm.isCreateState) {
    BreakEvenReference.read(vm.stateParams.id)
      .then(data => {
        vm.reference = data;
        vm.revenueType = !vm.reference.is_cost;
      })
      .catch(Notify.handleError);
  }

  function onSelectAccountReference(accountReference) {
    vm.reference.account_reference_id = accountReference.id;
  }

  function setRevenueType() {
    vm.revenueType = 1;
  }

  function unsetRevenueType() {
    vm.revenueType = 0;
  }

  // submit the data to the server from all two forms (update, create)
  function submit(breakEvenReferenceForm) {
    if (breakEvenReferenceForm.$invalid) { return null; }
    if (breakEvenReferenceForm.$pristine) { return null; }

    if (!vm.reference.is_cost) {
      vm.reference.is_variable = null;
    }

    if (vm.reference.is_cost) {
      vm.reference.is_turnover = null;
    }

    const promise = (vm.isCreateState)
      ? BreakEvenReference.create(vm.reference)
      : BreakEvenReference.update(vm.reference.id, vm.reference);

    return promise
      .then(() => {
        const translateKey = (vm.isCreateState) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('break_even_reference', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('break_even_reference');
  }
}
