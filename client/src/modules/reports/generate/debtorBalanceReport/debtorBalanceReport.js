angular.module('bhima.controllers')
.controller('debtorBalanceReportController', DebtorBalanceReportController);

DebtorBalanceReportController.$inject = [
  '$state', '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'BaseReportService', 'reportData',
];

function DebtorBalanceReportController($state, $sce, Notify, BaseReportService, AppCache, SavedReports, reportData) {
  var vm = this;
  var cache = new AppCache('configure_debtorAccountBalence');
  var reportUrl = 'reports/debtorAccountBalence';

  vm.reportDetails = {};
  var _url = '';

  vm.onSelectFiscal = function (fiscal) {
    _url = reportUrl + '/' + fiscal;
  }

  vm.requestSaveAs = function requestSaveAs() {
    var options = {
      url : _url,
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

    return SavedReports.requestPreview( _url, reportData.id, angular.copy(vm.reportDetails))
      .then(function (result) {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };
}
