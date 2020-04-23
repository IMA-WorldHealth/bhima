angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    // a list of all supported reported and their respective keys, this allows
    // the ui-view to be populated with the correct report configuration form
    const SUPPORTED_REPORTS = [
      'account_reference',
      'account_report',
      'account_report_multiple',
      'aged_creditors',
      'aged_debtors',
      'annual-clients-report',
      'balance_report',
      'balance_sheet_report',
      'cashflow',
      'cashflowByService',
      'cash_report',
      'employeeStanding',
      'feeCenter',
      'income_expense',
      'income_expense_by_month',
      'income_expense_by_year',
      'inventory_file',
      'inventory_report',
      'ohada_balance_sheet_report',
      'ohada_profit_loss',
      'open_debtors',
      'operating',
      'patientStanding',
      'stock_exit',
      'stock_entry',
      'stock_value',
      'unpaid-invoice-payments',
      'breakEven',
      'breakEvenFeeCenter',
      'indicatorsReport',
      'visit_report',
      'monthlyBalance',
      'debtorSummary',
      'clientDebts',
      'clientSupport',
      'analysisAuxiliaryCash',
      'realizedProfit',
      'systemUsageStat',
      'dataKit',
      'configurable_analysis_report',
      'purchaseOrderAnalysis',
      'inventoryChanges',
      'monthlyConsumptionReport',
      'stock_consumption_graph_report',
    ];

    function resolveReportData($stateParams, SavedReports) {
      const reportKey = $stateParams.key;
      return SavedReports.requestKey(reportKey)
        .then((results) => {
          return results[0];
        });

    }

    $stateProvider
      .state('reportsBase', {
        url : '/reports',
        controller : 'ReportsController as ReportCtrl',
        templateUrl : 'modules/reports/reports.html',
        resolve : {
          reportData : ['$stateParams', 'BaseReportService', resolveReportData],
        },
        abstract : true,
      })
      .state('reportsBase.reportsArchive', {
        url : '/:key/archive',
        controller : 'ReportsArchiveController as ArchiveCtrl',
        templateUrl : 'modules/reports/archive.html',
        params : { key : { squash : true, value : null } },
        resolve : {
          reportData : ['$stateParams', 'BaseReportService', resolveReportData],
        },
      });

    SUPPORTED_REPORTS.forEach((key) => {
      $stateProvider.state('reportsBase.'.concat(key), {
        url : '/'.concat(key),
        controller : key.concat('Controller as ReportConfigCtrl'),
        templateUrl : '/modules/reports/generate/'.concat(key, '/', key, '.html'),
        params : { key },
        resolve : {
          reportData : ['$stateParams', 'BaseReportService', resolveReportData],
        },
      });
    });
  }]);
