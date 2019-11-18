angular.module('bhima.controllers')
  .controller('monthlyBalanceController', MonthlyBalanceController);

MonthlyBalanceController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state', 'AccountService',
  'FormatTreeDataService',
];

function MonthlyBalanceController($sce, Notify, SavedReports, AppCache, reportData, $state, Accounts, FormatTreeData) {
  const vm = this;
  const cache = new AppCache('monthlyBalance');
  const reportUrl = 'reports/finance/monthly_balance';

  vm.previewGenerated = false;
  vm.reportDetails = {};

  Accounts.read()
    .then(elements => {
      // bind the accounts to the controller
      const accounts = FormatTreeData.order(elements);
      vm.accounts = accounts;
    });

  vm.onSelectFiscalYear = (fiscalYear) => {
    vm.reportDetails.fiscal_id = fiscalYear.id;
  };

  vm.onSelectPeriod = (period) => {
    vm.reportDetails.period_id = period.id;
    vm.reportDetails.periodLabel = period.hrLabel;
  };

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.preview = function preview(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return 0;
    }

    if (vm.account) {
      vm.reportDetails.accountNumber = vm.account.number;
      vm.reportDetails.accountLabel = vm.account.label;
      vm.reportDetails.accountId = vm.account.id;
    }

    if (vm.reportDetails.allAccount) {
      vm.reportDetails.accountNumber = null;
      vm.reportDetails.accountLabel = null;
      vm.reportDetails.accountId = null;
    }

    // update cached configuration
    cache.reportDetails = angular.copy(vm.reportDetails);

    return SavedReports.requestPreview(reportUrl, reportData.id, angular.copy(vm.reportDetails))
      .then(result => {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  vm.requestSaveAs = function requestSaveAs() {
    const options = {
      url : reportUrl,
      report : reportData,
      reportOptions : angular.copy(vm.reportDetails),
    };

    return SavedReports.saveAsModal(options)
      .then(() => {
        $state.go('reportsBase.reportsArchive', { key : options.report.report_key });
      })
      .catch(Notify.handleError);
  };

  checkCachedConfiguration();

  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
  }
}
