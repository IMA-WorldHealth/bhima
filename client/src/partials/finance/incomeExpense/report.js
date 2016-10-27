'use strict';

angular.module('bhima.controllers')
.controller('IncomeExpenseReportController', IncomeExpenseReportController);

// dependencies injection
IncomeExpenseReportController.$inject = [
  '$stateParams', 'IncomeExpenseService', 'NotifyService',
  'DateService', 'ExchangeRateService', 'VoucherService',
  'util',
];

/**
 * IncomeExpense report controller
 *
 * @description
 * This controller is responsible of Income Expense report, that report include
 * all incomes minus all depenses
 */
function IncomeExpenseReportController($stateParams, IncomeExpense, Notify, Dates, Exchange, Voucher, util) {
  var vm = this, session = vm.session = {};

  // expose to the view
  vm.showDetails = false;
  vm.basicDate = Dates.util.str;
  vm.reconfigure = reconfigure;
  vm.toggleDetails = toggleDetails;

  /** fill report with data */
  (function fill() {
    vm.cashbox = $stateParams.cashbox;
    vm.dateFrom = $stateParams.dateFrom;
    vm.dateTo = $stateParams.dateTo;
    vm.reportType = $stateParams.reportType;

    if (!vm.cashbox || !vm.dateFrom || !vm.dateTo || !vm.reportType) { return ; }
    session.currency_id = vm.cashbox ? vm.cashbox.currency_id : undefined;
    var params = {
      account_id: [vm.cashbox.account_id],
      dateFrom: Dates.util.str(vm.dateFrom),
      dateTo: Dates.util.str(vm.dateTo),
      reportType: vm.reportType
    };

    IncomeExpense.read(null, params)
    .then(reporting)
    .then(function () { vm.state = 'generate'; })
    .catch(Notify.handleError);
  })();

  /** show or hide details of the incomeExpense report */
  function toggleDetails() {
    vm.showDetails = !vm.showDetails;
  }

  /** reset report parameters */
  function reconfigure() {
    vm.state = undefined;

    initialization();
  }

  /**
   * @function reporting
   * @param {array} rows all Incomes and expenses of the given cashbox
   * @description
   * processing data for the report, the process is as follow :
   */
  function reporting(rows) {
    session.incomes           = rows.incomes;
    session.expenses          = rows.expenses;
    session.totalIncomes      = 0;
    session.totalExpenses     = 0;

    if(vm.reportType === 1 || vm.reportType === 2){
      rows.incomes.forEach(function (income) {
        session.totalIncomes += income.debit;
      });      
    }
    
    if(vm.reportType === 1 || vm.reportType === 3){
      rows.expenses.forEach(function (expense) {
        session.totalExpenses += expense.credit;
      });
    }   
  }

  /**
   * @function initialization
   * @description initialize global arrays and objects for the incomeExpense report
   */
  function initialization () {
    session.incomes          = {};
    session.expenses         = {};
    session.totalIncomes     = 0;
    session.totalExpenses    = 0;
  }

}
