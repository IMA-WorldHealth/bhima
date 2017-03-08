angular.module('bhima.controllers')
  .controller('report_accountsController', ReportAccountsConfigController);

ReportAccountsConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData'
];

function ReportAccountsConfigController($sce, Notify, SavedReports, AppCache, reportData) {
  var vm = this;
  var cache = new AppCache('configure_reports_account');
  var reportUrl = 'reports/finance/account';

  vm.previewGenerated = false;
  vm.reportDetails = {};

  checkCachedConfiguration();

  vm.selectAccount = function selectAccount(account) {
    vm.reportDetails.account = account.id;
  }

  vm.selectSource = function selectSource(source) {
    vm.reportDetails.source = source;
  }

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  }

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
  }

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
