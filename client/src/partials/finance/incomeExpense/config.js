'use strict';

angular.module('bhima.controllers')
.controller('IncomeExpenseConfigController', IncomeExpenseConfigController);

// dependencies injection
IncomeExpenseConfigController.$inject = [ '$state', '$translate', 'CashboxService', 'NotifyService' ];

/**
 * IncomeExpense config controller
 *
 * @description
 * This controller is responsible of cash flow report, that report include
 * all incomes minus all depenses
 */
function IncomeExpenseConfigController($state, $translate, Cashbox, Notify) {
  var vm = this;

  // expose to the view
  vm.generate = generate;

  vm.reportType = [
    {id: 1, label : $translate.instant('FORM.LABELS.INCOME_EXPENSE')},
    {id: 2, label : $translate.instant('FORM.LABELS.INCOME')},
    {id: 3, label : $translate.instant('FORM.LABELS.EXPENSE')}
  ];

  /** init */
  Cashbox.read(null, { detailed: 1, is_auxiliary: 0})
  .then(function (list) {
    list.forEach(function (cashbox) {
      cashbox.hrlabel = cashbox.label + ' ' + cashbox.symbol;
    });
    vm.cashboxes = list;
  })
  .catch(Notify.errorHandler);

  /** generate incomeExpense report */
  function generate() {
    if (!vm.cashbox || !vm.dateFrom || !vm.dateTo || !vm.report) { return ; }
    var params = {
      dateFrom : vm.dateFrom,
      dateTo   : vm.dateTo,
      cashbox  : vm.cashbox,
      reportType   : vm.report.id
    };

    $state.go('incomeExpense.report', params);
  }

}
