angular.module('bhima.controllers')
  .controller('account_reportController', AccountReportConfigController);

AccountReportConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state',
];

function AccountReportConfigController($sce, Notify, SavedReports, AppCache, reportData, $state) {
  var vm = this;
  var cache = new AppCache('configure_account_report');
  var reportUrl = 'reports/finance/account_report';

  vm.previewGenerated = false;
  vm.reportDetails = {};

  checkCachedConfiguration();

  vm.selectAccount = function selectAccount(account) {
    vm.reportDetails.account_id = account.id;
  };

  vm.selectSource = function selectSource(source) {
    vm.reportDetails.source = source;
  };

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.requestSaveAs = function requestSaveAs() {
    parseDateInterval(vm.reportDetails);

    var options = {
      url : reportUrl,
      report : reportData,
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

    parseDateInterval(vm.reportDetails);

    // update cached configuration
    cache.reportDetails = angular.copy(vm.reportDetails);

    return SavedReports.requestPreview(reportUrl, reportData.id, angular.copy(vm.reportDetails))
      .then(function (result) {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  // @TODO validation on dates - this should be done through a 'period select' component
  function parseDateInterval(reportDetails) {
    if (!vm.dateInterval) {
      reportDetails.dateTo = reportDetails.dateFrom = null;
    }
  }

  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
  }
}
