angular.module('bhima.routes')
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider

  /* incomeExpense page */
  .state('incomeExpense', {
    url : '/finance/reports/incomeExpense',
    params: { dateFrom: null, dateTo: null, cashbox: null, reportType: null  },
    controller : 'IncomeExpenseController as IncomeExpenseIndexCtrl',
    templateUrl : 'partials/finance/incomeExpense/index.html'
  })

  /* incomeExpense configuration */
  .state('incomeExpense.configure', {
    controller : 'IncomeExpenseConfigController as IncomeExpenseConfigCtrl',
    templateUrl : 'partials/finance/incomeExpense/config.html'
  })

  /* incomeExpense report */
  .state('incomeExpense.report', {
    controller : 'IncomeExpenseReportController as IncomeExpenseReportCtrl',
    templateUrl : 'partials/finance/incomeExpense/report.html'
  });

}]);
