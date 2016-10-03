
angular.module('bhima.controllers')
  .controller('TrialBalanceMainFooterController', TrialBalanceMainFooterController);

TrialBalanceMainFooterController.$inject = ['$state', '$uibModalStack'];

/**
 * @module journal/modals/JournalPoster.modal
 *
 * @description
 * This controller provides a tool to do trial balance
 */
function TrialBalanceMainFooterController($state, $uibModalStack) {
  var vm = this;

  vm.state = $state;

  /**
   * @function cancel
   * @description
   * closes the modal and stop the posting process
   **/
  function cancel() {
    $state.transitionTo('journal');
    $uibModalStack.dismissAll();
  }

  vm.cancel = cancel;
}
