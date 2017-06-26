angular.module('bhima.controllers')
  .controller('clients_reportController', ClientsReportConfigController);

ClientsReportConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData',
  '$state', 'moment'
];

function ClientsReportConfigController($sce, Notify, SavedReports, AppCache, reportData, $state, Moment) {
  var vm = this;
  var cache = new AppCache('configure_clients_report');
  var reportUrl = 'reports/finance/clientsReport';

  vm.previewGenerated = false;
  vm.reportDetails = {};

  checkCachedConfiguration();

  vm.onDebtorGroupSelected = function onDebtorGroupSelected (debtorGroups){
    vm.reportDetails.ignoredClients = debtorGroups;
  }

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
    // We don't nee to save this data
    delete vm.reportDetails.ignoredClients;
  };

  vm.requestSaveAs = function requestSaveAs() {
    var options = {
      url : reportUrl,
      report : reportData,
      reportOptions : sanitiseDateStrings(vm.reportDetails),
    };

    return SavedReports.saveAsModal(options)
      .then(function () {
        $state.go('reportsBase.reportsArchive', { key : options.report.report_key });
      })
      .catch(Notify.handleError);
  };

  vm.preview = function preview(form) {
    if (form.$invalid) { return; }

    var sendDetails = sanitiseDateStrings(vm.reportDetails);
    sendDetails.dateTo = Moment(sendDetails.dateTo).format('YYYY-MM-DD');
    sendDetails.dateFrom = Moment(sendDetails.dateFrom).format('YYYY-MM-DD');

    return SavedReports.requestPreview(reportUrl, reportData.id, sendDetails)
      .then(function (result) {
        // We don't nee to save this data
        delete vm.reportDetails.ignoredClients;
        
        // update cached configuration
        cache.reportDetails = angular.copy(vm.reportDetails);
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  function sanitiseDateStrings(options) {
    var sanitisedOptions = angular.copy(options);
    sanitisedOptions.dateTo = Moment(sanitisedOptions.dateTo).format('YYYY-MM-DD');
    sanitisedOptions.dateFrom = Moment(sanitisedOptions.dateFrom).format('YYYY-MM-DD');
    return sanitisedOptions;
  }

  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
  }
}
