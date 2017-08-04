angular.module('bhima.controllers')
  .controller('balance_sheet_reportController', BalanceSheetReportConfigController);

BalanceSheetReportConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache',
  'reportData', '$state', 'LanguageService', '$timeout',
];

function BalanceSheetReportConfigController($sce, Notify, SavedReports, AppCache,
  reportData, $state, Languages, $timeout) {
  var vm = this;
  var cache = new AppCache('configure_balance_sheet_report');
  var reportUrl = 'reports/finance/balance_sheet';

  vm.previewGenerated = false;

  // FIXME(@jniles) - why is this needed?
  $timeout(function run() {
    vm.reportDetails = { date : new Date() };
  }, 0);

  checkCachedConfiguration();

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.requestSaveAs = function requestSaveAs() {
    var options = {
      url : reportUrl,
      report : reportData,
      lang : Languages.key,
      reportOptions : angular.copy(vm.reportDetails),
    };

    return SavedReports.saveAsModal(options)
      .then(function () {
        $state.go('reportsBase.reportsArchive', { key : options.report.report_key });
      })
      .catch(Notify.handleError);
  };

  vm.preview = function preview(form) {
    if (form.$invalid) { return; }

    // update cached configuration
    cache.reportDetails = angular.copy(vm.reportDetails);

    return SavedReports.requestPreview(reportUrl, reportData.id, angular.copy(vm.reportDetails))
      .then(function (result) {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
  }
}
