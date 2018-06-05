angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    // a list of all supported reported and their respective keys, this allows
    // the ui-view to be populated with the correct report configuration form
    const SUPPORTED_REPORTS = [
      'cash_report',
      'account_report',
      'balance_sheet_report',
      'income_expense',
      'aged_debtors',
      'open_debtors',
      'balance_report',
      'clients_report',
      'inventory_report',
      'inventory_file',
      'cashflowByService',
      'aged_creditors',
      'cashflow',
      'operating',
      'debtorBalanceReport',
      'stock_exit',
      'employeeStanding',
      'patientStanding',
    ];

    $stateProvider
      .state('reportsBase', {
        url : '/reports',
        controller : 'ReportsController as ReportCtrl',
        templateUrl : 'modules/reports/reports.html',
        resolve : {
          reportData : ['$stateParams', 'BaseReportService', ($stateParams, SavedReports) => {
            const reportKey = $stateParams.key;
            return SavedReports.requestKey(reportKey)
              .then((results) => { return results[0]; });
          }],
        },
        abstract : true,
      })
      .state('reportsBase.reportsArchive', {
        url : '/:key/archive',
        controller : 'ReportsArchiveController as ArchiveCtrl',
        templateUrl : 'modules/reports/archive.html',
        params : { key : { squash : true, value : null } },
      });

    SUPPORTED_REPORTS.forEach((key) => {
      $stateProvider.state('reportsBase.'.concat(key), {
        url : '/'.concat(key),
        controller : key.concat('Controller as ReportConfigCtrl'),
        templateUrl : '/modules/reports/generate/'.concat(key, '/', key, '.html'),
        params : { key },
      });
    });
  }]);

