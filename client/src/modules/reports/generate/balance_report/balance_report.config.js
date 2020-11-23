angular.module('bhima.controllers')
  .controller('balance_reportController', BalanceReportConfigController);

BalanceReportConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state',
];

/**
 * @function BalanceReportConfigController
 *
 * @description
 * This function renders the balance report.
 */
function BalanceReportConfigController($sce, Notify, SavedReports, AppCache, reportData, $state) {
  const vm = this;
  const cache = new AppCache('BalanceReport');
  const reportUrl = 'reports/finance/balance';

  vm.previewGenerated = false;
  vm.reportDetails = {};

  vm.onSelectFiscalYear = (fiscalYear) => {
    vm.reportDetails.fiscal_id = fiscalYear.id;
  };

  vm.onSelectPeriod = (period) => {
    vm.reportDetails.period_id = period.id;
  };

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.onChangeLayout = (bool) => {
    vm.reportDetails.useSeparateDebitsAndCredits = bool;
  };

  vm.onChangeEmptyRows = (bool) => {
    vm.reportDetails.shouldPruneEmptyRows = bool;
  };

  vm.onChangeHideTitleAccounts = (bool) => {
    vm.reportDetails.shouldHideTitleAccounts = bool;
  };

  vm.onChangeClosingBalances = bool => {
    vm.reportDetails.includeClosingBalances = bool;
  };

  vm.onSelectCronReport = report => {
    vm.reportDetails = angular.copy(report);
  };

  vm.preview = function preview(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return 0;
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
    // Set the defaults for the radio items
    if (!angular.isDefined(vm.reportDetails.useSeparateDebitsAndCredits)) {
      vm.reportDetails.useSeparateDebitsAndCredits = 1;
    }
    if (!angular.isDefined(vm.reportDetails.shouldPruneEmptyRows)) {
      vm.reportDetails.shouldPruneEmptyRows = 1;
    }
    if (!angular.isDefined(vm.reportDetails.shouldHideTitleAccounts)) {
      vm.reportDetails.shouldHideTitleAccounts = 0;
    }
  }
}
