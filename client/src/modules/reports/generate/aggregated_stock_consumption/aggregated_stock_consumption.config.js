angular.module('bhima.controllers')
  .controller('aggregated_stock_consumptionController', StockAggregatedConsumptionConfigController);

StockAggregatedConsumptionConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService',
  'AppCache', 'reportData', '$state',
  'LanguageService', 'moment',
];

function StockAggregatedConsumptionConfigController($sce, Notify, SavedReports,
  AppCache, reportData, $state, Languages, moment) {
  const vm = this;
  const cache = new AppCache('configure_aggregated_stock_consumption_report');
  const reportUrl = 'reports/stock/aggregated_consumption_report';

  // Default values
  vm.dateTo = new Date();

  // check cached configuration
  checkCachedConfiguration();

  vm.onSelectDepot = (depot) => {
    vm.depot_uuid = depot.uuid;
  };

  vm.onSelectGroup = (group) => {
    vm.group_uuid = group.uuid;
  };

  vm.clear = function clear(key) {
    delete vm[key];
  };

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  function formatData() {
    const params = {
      dateFrom : vm.dateFrom,
      dateTo : vm.dateTo,
      inventoryGroupUuid : vm.group_uuid,
      depotUuid : vm.depot_uuid,
    };
    cache.reportDetails = angular.copy(params);
    params.dateFrom = moment(params.dateFrom).format('YYYY-MM-DD');
    params.dateTo = moment(params.dateTo).format('YYYY-MM-DD');

    const options = {
      params,
      lang : Languages.key,
    };

    vm.reportDetails = options;
    return vm.reportDetails;
  }

  vm.preview = function preview(form) {
    if (form.$invalid) { return 0; }

    vm.reportDetails = formatData();

    return SavedReports.requestPreview(reportUrl, reportData.id, angular.copy(vm.reportDetails))
      .then((result) => {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  vm.requestSaveAs = function requestSaveAs() {
    vm.reportDetails = formatData();
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
