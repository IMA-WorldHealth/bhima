angular.module('bhima.controllers')
  .controller('TrialBalanceController', TrialBalanceController);

TrialBalanceController.$inject = ['TrialBalanceService', '$state', 'NotifyService'];

/**
 * @class TrialBalanceController
 *
 * @description
 * This applies to the structure.html file
 */
function TrialBalanceController(TrialBalance, $state, Notify) {
  var vm = this;

  function startup() {
    vm.isLoading = true;

    TrialBalance.errors()
      .then(function (errors) {
        var hasErrors = Boolean(errors.length);

        vm.numErrors = errors.length;
        vm.showErrorMessage = hasErrors;
        vm.showSuccessMessage = !hasErrors;
      })
      .finally(function () {
        vm.isLoading = false;
      });
  }

  // attach the grid exporter as needed
  vm.export = function exporter() {
    TrialBalance.exportGrid();
  };

  vm.submit = function submit() {
    // compute the number of transactions
    var numTransactions = TrialBalance.transactions().length;

    TrialBalance.postToGeneralLedger()
      .then(function () {
        Notify.success('JOURNAL.TRIAL_BALANCE.POSTED_TRANSACTIONS', { numRecords : numTransactions });

        $state.go('journal', null, { reload : true });
      })
      .catch(Notify.handleError);
  };

  startup();
}
