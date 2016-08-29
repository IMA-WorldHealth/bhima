'use strict';

angular.module('bhima.controllers')
.controller('CashflowController', CashflowController);

// dependencies injection
CashflowController.$inject = [ '$state', '$stateParams', 'ModalService', 'LanguageService', 'DateService'];

/**
 * Cashflow controller
 *
 * @description
 * This controller is responsible of cash flow report, that report include
 * all incomes minus all depenses
 */
function CashflowController($state, $stateParams, Modal, Languages, Dates) {
  var vm = this;

  // global variables
  vm.report = $stateParams.dateFrom && $stateParams.dateTo && $stateParams.cashbox;

  // expose to the view
  vm.reconfigure = reconfigure;

  /** reset report parameters */
  function reconfigure() {
    $state.go('cashflow.configure');
  }

  /** init */
  (function init() {

    vm.pdfParams = {
      account_id: $stateParams.cashbox ? [$stateParams.cashbox.account_id] : null,
      dateFrom: Dates.util.str($stateParams.dateFrom),
      dateTo: Dates.util.str($stateParams.dateTo),
      lang: Languages.key
    };

    if (!vm.report) {
        $state.go('cashflow.configure');
    }
  })();

}
