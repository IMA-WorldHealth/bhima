angular.module('bhima.controllers')
  .controller('cash_reportController', CashReportConfigController);

CashReportConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state',
];

function CashReportConfigController($sce, Notify, SavedReports, AppCache, reportData, $state) {
  const vm = this;
  const cache = new AppCache('configure_cash_report');
  const reportUrl = 'reports/finance/cash_report';

  vm.previewGenerated = false;
  vm.reportDetails = {};
  vm.reportTypes = [
    { id : 1, label : 'FORM.LABELS.ENTRY_EXIT' },
    { id : 2, label : 'FORM.LABELS.ENTRY' },
    { id : 3, label : 'FORM.LABELS.EXIT' },
  ];

  vm.reportFormats = [
    { id : 1, label : 'FORM.LABELS.CASH_JOURNAL' },
    { id : 2, label : 'FORM.LABELS.CASH_SPLITED' },
  ];

  checkCachedConfiguration();

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.preview = function preview(form) {
    if (form.$invalid) { return; }

    // update cached configuration
    cache.reportDetails = angular.copy(vm.reportDetails);

    return SavedReports.requestPreview(reportUrl, reportData.id, angular.copy(vm.reportDetails))
      .then((result) => {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  vm.onSelectCashbox = function onSelectCashbox(cashbox) {
    vm.reportDetails.account_id = cashbox.account_id;
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

  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
    vm.reportDetails.type = 1;
    vm.reportDetails.format = 1;
  }
}
