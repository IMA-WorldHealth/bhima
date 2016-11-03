angular.module('bhima.controllers')
  .controller('IncomeExpenseController', IncomeExpenseController);

// dependencies injection
IncomeExpenseController.$inject = [ '$state', '$stateParams', 'ModalService', 'LanguageService', 'DateService'];

/**
 * IncomeExpense controller
 *
 * @description
 * This controller is responsible of cash flow report, that report include
 * all incomes minus all depenses
 */
function IncomeExpenseController($state, $stateParams, Modal, Languages, Dates) {
  var vm = this;

  // global variables
  vm.report = $stateParams.dateFrom && $stateParams.dateTo && $stateParams.cashbox && $stateParams.reportType;

  // expose to the view
  vm.reconfigure = reconfigure;

  // init
  vm.pdfParams = {
    account_id: $stateParams.cashbox ? [$stateParams.cashbox.account_id] : null,
    dateFrom: Dates.util.str($stateParams.dateFrom),
    dateTo: Dates.util.str($stateParams.dateTo),
    reportType: $stateParams.reportType,
    lang: Languages.key
  };

  if (!vm.report) {
    $state.go('incomeExpense.configure');
  }

  /** reset report parameters */
  function reconfigure() {
    $state.go('incomeExpense.configure');
  }

}
