
angular.module('bhima.controllers')
  .controller('TrialBalanceErrorFooterController', TrialBalanceErrorFooterController);

TrialBalanceErrorFooterController.$inject = ['$state', '$stateParams'];

/**
 * @module journal/modals/trialBalanceError.footer.js
 *
 * @description
 * This controller handles the footer of the model in the trialBalanceError state
 */
function TrialBalanceErrorFooterController($state, $stateParams) {
  var vm = this;
  vm.stateParams = $stateParams;

  /**
   * @function reset
   * @description
   * switch back to the trialBalanceMain state
   **/
  function reset() {
    $state.go('trialBalanceMain', {records : $stateParams.records}, {reload : false});
  }

  vm.reset = reset;
}
