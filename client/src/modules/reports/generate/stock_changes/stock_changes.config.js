angular.module('bhima.controllers')
  .controller('stock_changesController', StockChangesReportConfigCtrl);

StockChangesReportConfigCtrl.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state',
  'LanguageService',
];

function StockChangesReportConfigCtrl($sce, Notify, SavedReports, AppCache, reportData, $state, Languages) {
  const vm = this;

  const cache = new AppCache('stock_changes');
  const reportUrl = 'reports/stock/changes';

  // default values
  vm.reportDetails = {};
  vm.previewGenerated = false;

  // check cached configuration
  checkCachedConfiguration();

  vm.onSelectFiscalYear = year => {
    vm.reportDetails.fiscal_id = year.id;
  };

  vm.onSelectPeriod = period => {
    vm.reportDetails.period_id = period.id;
  };

  vm.onSelectDepot = depot => {
    vm.reportDetails.depot_uuid = depot.uuid;
  };

  vm.clearPreview = () => {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.preview = form => {
    if (form.$invalid) {
      return 0;
    }

    // update cached configuration
    cache.reportDetails = angular.copy(vm.reportDetails);
    angular.extend(vm.reportDetails, { lang : Languages.key });

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
