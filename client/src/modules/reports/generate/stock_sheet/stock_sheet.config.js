angular.module('bhima.controllers')
  .controller('stock_sheetController', StockSheetConfigController);

StockSheetConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state',
  'LanguageService', 'moment',
];

function StockSheetConfigController($sce, Notify, SavedReports, AppCache, reportData, $state, Languages, moment) {
  const vm = this;
  const cache = new AppCache('configure_stock_sheet_report');
  const reportUrl = 'reports/stock/sheet';

  vm.previewGenerated = false;
  vm.havingDateInterval = 0;

  vm.reportDetails = {
    dateTo : new Date(),
    orderByCreatedAt : 0,
  };

  // check cached configuration
  checkCachedConfiguration();

  vm.changeHavingDateInterval = value => {
    vm.havingDateInterval = value;
    vm.reportDetails.dateFrom = value ? new Date() : undefined;
    vm.reportDetails.dateTo = new Date();
  };

  vm.onDateChange = (date) => {
    vm.reportDetails.dateTo = date;
  };

  vm.setOrderByCreatedAt = value => {
    vm.reportDetails.orderByCreatedAt = value;
  };

  vm.onSelectDepot = function onSelectDepot(depot) {
    vm.reportDetails.depot_uuid = depot.uuid;
  };

  vm.onSelectInventory = function onSelectInventory(inventory) {
    vm.reportDetails.inventory_uuid = inventory.uuid;
  };

  vm.clear = function clear(key) {
    delete vm.reportDetails[key];
  };

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.preview = function preview(form) {
    if (form.$invalid) { return 0; }

    const options = angular.copy(vm.reportDetails);

    // update cached configuration
    cache.reportDetails = angular.copy(options);

    if (vm.havingDateInterval) {
      options.dateFrom = moment(options.dateFrom).format('YYYY-MM-DD');
    }

    // format date for the server
    options.dateTo = moment(options.dateTo).format('YYYY-MM-DD');
    options.lang = Languages.key;

    return SavedReports.requestPreview(reportUrl, reportData.id, options)
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
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
  }
}
