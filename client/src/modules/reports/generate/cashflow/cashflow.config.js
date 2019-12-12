angular.module('bhima.controllers')
  .controller('cashflowController', CashFlowConfigController);

CashFlowConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state',
];

function CashFlowConfigController($sce, Notify, SavedReports, AppCache, reportData, $state) {
  const vm = this;
  const cache = new AppCache('configure_cashflow');
  const reportUrl = 'reports/finance/cashflow/';

  vm.previewGenerated = false;
  vm.reportDetails = {};
  vm.checked = 0;

  checkCachedConfiguration();

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.onSelectCronReport = report => {
    vm.reportDetails = angular.copy(report);
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
      .then((result) => {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  vm.onSelectCashboxes = (cashboxesIds) => {
    vm.reportDetails.cashboxesIds = cashboxesIds;
  };

  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
  }
}
