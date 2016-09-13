angular.module('bhima.routes')
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider

  /* cashflow page */
  .state('cashflow', {
    url : '/finance/reports/cashflow',
    params: { dateFrom: null, dateTo: null, cashbox: null },
    controller : 'CashflowController as CashflowIndexCtrl',
    templateUrl : 'partials/finance/cashflow/index.html'
  })

  /* cashflow configuration */
  .state('cashflow.configure', {
    controller : 'CashflowConfigController as CashflowConfigCtrl',
    templateUrl : 'partials/finance/cashflow/config.html'
  })

  /* cashflow report */
  .state('cashflow.report', {
    controller : 'CashflowReportController as CashflowReportCtrl',
    templateUrl : 'partials/finance/cashflow/report.html'
  });

}]);
