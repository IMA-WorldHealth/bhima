angular.module('bhima.controllers')
  .controller('open_debtorsController', OpenDebtorsConfigController);

OpenDebtorsConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state', 'OpenDebtorsReportService',
];

function OpenDebtorsConfigController($sce, Notify, SavedReports, AppCache, reportData, $state, OpenDebtorsReports) {
  var vm = this;
  var cache = new AppCache('configure_open_debtors');
  var reportUrl = 'reports/finance/debtors/open';

  vm.previewGenerated = false;

  // default values for the report
  vm.reportDetails = {
    showDetailedView : 0,
    showUnverifiedTransactions : 0,
    limitDate : 0,
  };

  // bind service variables for rendering the dropdown
  vm.orders = OpenDebtorsReports.orders;
  vm.ASC = OpenDebtorsReports.ASC;
  vm.DESC = OpenDebtorsReports.DESC;

  // the date input is hidden by default
  vm.showDateLimit = false;

  checkCachedConfiguration();

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.requestSaveAs = function requestSaveAs() {
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

    // update cached configuration
    cache.reportDetails = angular.copy(vm.reportDetails);

    return SavedReports.requestPreview(reportUrl, reportData.id, angular.copy(vm.reportDetails))
      .then(function (result) {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  vm.onSelectPeriod =  function onSelectPeriod(period){
    vm.reportDetails.date = period.end_date;
  };

  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
  }
}
