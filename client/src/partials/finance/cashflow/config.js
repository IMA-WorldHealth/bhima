'use strict';

angular.module('bhima.controllers')
.controller('CashflowConfigController', CashflowConfigController);

// dependencies injection
CashflowConfigController.$inject = [ '$state', 'CashboxService', 'NotifyService' ];

/**
 * Cashflow config controller
 *
 * @description
 * This controller is responsible of cash flow report, that report include
 * all incomes minus all depenses
 */
function CashflowConfigController($state, Cashbox, Notify) {
  var vm = this;

  // expose to the view
  vm.generate = generate;

  /** generate cashflow report */
  function generate() {
    if (!vm.cashbox || !vm.dateFrom || !vm.dateTo) { return ; }
    var params = {
      dateFrom : vm.dateFrom,
      dateTo   : vm.dateTo,
      cashbox  : vm.cashbox
    };
    $state.go('cashflow.report', params);
  }

  /** init */
  (function init() {
    Cashbox.read(null, { detailed: 1, is_auxiliary: 0})
    .then(function (list) {
      list.forEach(function (cashbox) {
        cashbox.hrlabel = cashbox.label + ' ' + cashbox.symbol;
      });
      vm.cashboxes = list;
    })
    .catch(Notify.errorHandler);
  })();

}
