
angular.module('bhima.controllers')
  .controller('TrialBalanceErrorFooterController', TrialBalanceErrorFooterController);

TrialBalanceErrorFooterController.$inject = ['$state'];

/**
 * @module journal/modals/JournalPoster.modal
 *
 * @description
 * This controller provides a tool to do trial balance
 */
function TrialBalanceErrorFooterController($state) {
  var vm = this;
  vm.state = $state;

  /**
   * @function cancel
   * @description
   * closes the modal and stop the posting process
   **/
  function cancel() {
    $state.transitionTo('journal');
  }

  vm.cancel = cancel;
}
