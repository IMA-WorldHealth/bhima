angular.module('bhima.controllers')
  .controller('visit_reportController', VisitReportController);

VisitReportController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state',
  'LanguageService', 'moment',
];

function VisitReportController(
  $sce, Notify, SavedReports, AppCache,
  reportData, $state, Languages
) {
  const vm = this;
  const cache = new AppCache('configure_visit_report');
  const reportUrl = 'reports/visits';

  vm.previewGenerated = false;
  vm.dateFrom = new Date();
  vm.dateTo = new Date();

  // check cached configuration
  checkCachedConfiguration();

  vm.clear = function clear(key) {
    delete vm[key];
  };

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.preview = function preview(form) {
    if (form.$invalid) { return 0; }

    const params = {
      dateFrom : vm.dateFrom,
      dateTo : vm.dateTo,
    };

    // update cached configuration
    cache.reportDetails = angular.copy(params);

    const options = {
      params,
      lang : Languages.key,
    };

    vm.reportDetails = options;

    return SavedReports.requestPreview(reportUrl, reportData.id, angular.copy(vm.reportDetails))
      .then((result) => {
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

  function checkCachedConfiguration() {
    vm.reportDetails = angular.copy(cache.reportDetails || {});
  }
}
