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
   * @function submit
   * @description for submitting a dialog content
   */
  function submit() {
    vm.loading = true;
    trialBalanceService.postToGeneralLedger($state.params.records)
      .then(function () {
        $state.go('journal', null, { reload: true });
      })
      .catch(Notify.handleError)
      .finally(function () {
        vm.loading = false;
      });
  }

  vm.submit = submit;
}
