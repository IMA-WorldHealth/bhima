angular.module('bhima.controllers')
  .controller('stock_exitController', InventoryFileConfigController);

InventoryFileConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state',
  'LanguageService',
];

function InventoryFileConfigController($sce, Notify, SavedReports, AppCache, reportData, $state, Languages) {
  const vm = this;
  const cache = new AppCache('configure_stock_exit_report');
  const reportUrl = 'reports/stock/exit';

  // default values
  vm.includePatientExit = 1;
  vm.previewGenerated = false;

  // check cached configuration
  checkCachedConfiguration();

  vm.onSelectDepot = depot => {
    vm.depot = depot;
  };

  vm.clear = key => {
    delete vm[key];
  };

  vm.clearPreview = () => {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.preview = form => {
    if (form.$invalid) { return 0; }

    const params = {
      depotUuid : vm.depot.uuid,
      dateFrom : vm.dateFrom,
      dateTo : vm.dateTo,
      includePatientExit : vm.includePatientExit,
      includeServiceExit : vm.includeServiceExit,
      includeDepotExit : vm.includeDepotExit,
      includeLossExit : vm.includeLossExit,
      showDetails : vm.showDetails,
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
