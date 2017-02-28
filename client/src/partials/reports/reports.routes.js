angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    // a list of all supported reported and their respective keys, this allows
    // the ui-view to be populated with the correct report configuration form
    /* @const */
    var SUPPORTED_REPORTS = {
      ACCOUNT_HISTORY : {
        url : '/report_accounts',
        controller : 'report_accountsController as ReportConfigCtrl',
        templateUrl : '/partials/reports/modals/report_accounts.modal.html'
      }
    };

    $stateProvider
      .state('reportsBase', {
        url : '/reports',
        controller : 'ReportsController as ReportCtrl',
        templateUrl : 'partials/reports/reports.html',
        abstract : true
       })

      .state('reportsBase.accountsHistory', SUPPORTED_REPORTS.ACCOUNT_HISTORY);
      // .state('reportsBase.chartOfAccounts', SUPPORTED_REPORTS.CHART_OF_ACCOUNTS)
 }]);

