
angular.module('bhima.controllers')
  .controller('TrialBalanceDetailFooterController', TrialBalanceDetailFooterController);

TrialBalanceDetailFooterController.$inject = ['$state', '$stateParams', '$uibModalStack'];

/**
 * @module journal/modals/JournalPoster.modal
 *
 * @description
 * This controller provides a tool to do trial balance
 */
function TrialBalanceDetailFooterController($state, $stateParams, $uibModalStack) {
  var vm = this;
  vm.state = $state;

  /**
   * @function cancel
   * @description
   * closes the modal and stop the posting process
   **/
  function cancel() {
    // $uibModalStack.dismissAll();
    $state.go('trialBalanceMain', {records : $stateParams.records}, {reload : false});
  }


  /**
   * @function : viewErrorReport
   *
   * @description :
   * From whatever view, this function help to see every errors and warnings relative to a selected set of transaction
   *
   * This function fills the grid data by error code :
   * - It begins by configuring column visibility
   * - Fill the data through the parseGridRecord function of the journal error service
   * - Grouping data by code
   * - Setting the detailView flag to true
   *
   * This view is not the main view, because you can not post to the general ledger from this view,
   * you have to reset the view to the last main view first, this view is just giving complementary information to the user.
   **/
  function viewErrorReport () {
    $state.go('trialBalanceMain', {records : $stateParams.rows}, {reload : false});
    // $uibModalStack.dismissAll();
    // $state.go('trialBalanceErrors', {feedBack : vm.state.params.feedBack, errors : vm.errors}, {reload : false});
  }

  vm.cancel = cancel;
  vm.viewErrorReport = viewErrorReport;
}
