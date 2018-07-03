angular.module('bhima.controllers')
  .controller('debtorBalanceReportController', DebtorBalanceReportController);

DebtorBalanceReportController.$inject = [
  '$state', '$sce', 'NotifyService', 'BaseReportService', 'AppCache',
  'BaseReportService', 'reportData',
];

/**
 * @function DebtorBalanceReportController
 *
 * @description
 * The debtor balance report provides a view of the current balance of each
 * debtor group in the enterprise.  It is slightly easier to use than the aged
 * debtors report, but contains the same information, sans aging.
 */
function DebtorBalanceReportController($state, $sce, Notify, BaseReportService, AppCache, SavedReports, reportData) {
  const vm = this;
  const cache = new AppCache('configure_debtorAccountBalance');
  const reportUrl = 'reports/debtorAccountBalance';

  vm.reportDetails = {};

  checkCachedConfiguration();

  // update the fiscal year on selection
  vm.onSelectFiscal = fiscal => {
    vm.reportDetails.fiscalId = fiscal.id;
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

  vm.preview = function preview(form) {
    if (form.$invalid) { return 0; }

    // update cached configuration
    cache.reportDetails = angular.copy(vm.reportDetails);

    return SavedReports.requestPreview(reportUrl, reportData.id, angular.copy(vm.reportDetails))
      .then(result => {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
  }
}
