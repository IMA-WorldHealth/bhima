angular.module('bhima.controllers')
  .controller('TrialBalanceMainFooterController', TrialBalanceMainFooterController);

TrialBalanceMainFooterController.$inject = [
  '$state', 'TrialBalanceService', 'NotifyService',
];

/**
 * @module journal/modals/trialBalanceMain.footer.js
 *
 * @description
 * This controller handles the view for the footer of the trial balance modal
 */
function TrialBalanceMainFooterController($state, trialBalanceService, Notify) {
  var vm = this;
  vm.state = $state;

  /**
   * @function cancel
   * @description
   * closes the modal and stop the posting process
   **/
  function cancel() {
    $state.go('journal');
  }

  /**
   * @function submit
   * @description for submitting a dialog content
   */
  function submit() {
    vm.loading = true;
    trialBalanceService.postToGeneralLedger($state.params.records)
      .then(function () {
        $state.go('postedJournal');
      })
      .catch(Notify.handleError)
      .finally(function () {
        vm.loading = false;
      });
  }

  vm.cancel = cancel;
  vm.submit = submit;
}
