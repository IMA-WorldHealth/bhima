angular.module('bhima.controllers')
  .controller('TrialBalanceDetailFooterController', TrialBalanceDetailFooterController);

TrialBalanceDetailFooterController.$inject = ['$state', '$stateParams'];

/**
 * @module journal/modals/TrialBalanceDetail.footer.js
 *
 * @description
 * This controller provides a tool to handle the footer of the modal in the trialBalanceDetail state
 */
function TrialBalanceDetailFooterController($state, $stateParams) {
  var vm = this;

  vm.stateParams = $stateParams;

  /**
   * @function cancel
   * @description
   * Go to the trialBalanceMain state from the trialBalanceDetail state
   **/
  function reset() {
    $state.go('trialBalanceMain', { records: $stateParams.records }, { reload: false });
  }

  /**
   * @function cancel
   * @description
   * closes the modal and stop the posting process
   **/
  function cancel() {
    $state.go('journal');
  }

  vm.reset = reset;
  vm.cancel = cancel;
}
