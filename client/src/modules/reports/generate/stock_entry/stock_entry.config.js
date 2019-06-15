angular.module('bhima.controllers')
  .controller('stock_entryController', StockEntryConfigController);

StockEntryConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state',
  'LanguageService',
];

function StockEntryConfigController($sce, Notify, SavedReports, AppCache, reportData, $state, Languages) {
  const vm = this;
  const cache = new AppCache('configure_stock_entry_report');
  const reportUrl = 'reports/stock/entry';

  // default values
  vm.includePurchaseEntry = 1;
  vm.includeIntegrationEntry = 0;
  vm.includeDonationEntry = 0;
  vm.includeTransferEntry = 0;
  vm.previewGenerated = false;
  vm.onEntryTypeChange = onEntryTypeChange;

  // check cached configuration
  checkCachedConfiguration();

  // check checked entry type
  onEntryTypeChange();

  vm.onSelectDepot = depot => {
    vm.reportDetails.depotUuid = depot.uuid;
  };

  vm.clear = key => {
    delete vm[key];
  };

  vm.clearPreview = () => {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.preview = form => {
    if (form.$invalid) {
      return 0;
    }

    if (!vm.hasOneChecked) {
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

  function onEntryTypeChange() {
    // be sure at least one checkbox is checked
    const sum = vm.includePurchaseEntry
      + vm.includeIntegrationEntry + vm.includeDonationEntry + vm.includeTransferEntry;
    vm.hasOneChecked = sum > 0;
  }
}
