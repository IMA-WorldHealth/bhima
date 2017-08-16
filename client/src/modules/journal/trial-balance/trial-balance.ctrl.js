angular.module('bhima.controllers')
  .controller('TrialBalanceController', TrialBalanceController);

TrialBalanceController.$inject = ['TrialBalanceService'];

/**
 * @class TrialBalanceController
 *
 * @description
 * This applies to the structure.html file
 */
function TrialBalanceController(TrialBalance) {
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

  startup();
}
