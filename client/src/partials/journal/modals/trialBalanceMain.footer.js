
angular.module('bhima.controllers')
  .controller('TrialBalanceMainFooterController', TrialBalanceMainFooterController);

TrialBalanceMainFooterController.$inject = [
  '$state', 'TrialBalanceService', 'NotifyService'
];

/**
 * @module journal/modals/trialBalanceMain.footer.js
 *
 * @description
 * This controller handles the view for the footer of the trial balance modal
 */
function TrialBalanceMainFooterController($state, trialBalanceService, Notify) {
  window.state = $state;
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

  /**
   * @function submit
   * @description for submitting a dialog content
   */
  function submit() {
    trialBalanceService.postToGeneralLedger($state.params.records)
      .then(function () {
        $state.go('generalLedger', null, {notify : true});
      })
      .catch(Notify.handleError);
  }

  vm.cancel = cancel;
  vm.submit = submit;
}
