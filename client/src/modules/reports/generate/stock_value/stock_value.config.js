angular.module('bhima.controllers')
  .controller('stock_valueController', StockValueConfigController);

StockValueConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService',
  'AppCache', 'reportData', '$state',
  'LanguageService', 'moment',
];

function StockValueConfigController($sce, Notify, SavedReports,
  AppCache, reportData, $state, Languages, moment) {
  const vm = this;
  const cache = new AppCache('configure_stock_value_report');
  const reportUrl = 'reports/stock/value';

  vm.previewGenerated = false;
  vm.orderByCreatedAt = 0;
  vm.dateTo = new Date();

  vm.onDateChange = (date) => {
    vm.dateTo = date;
  };

  // check cached configuration
  checkCachedConfiguration();

  vm.onSelectDepot = function onSelectDepot(depot) {
    vm.depot = depot;
    formatData();
  };

  vm.onSelectCronReport = report => {
    vm.reportDetails = angular.copy(report);
  };

  vm.clear = function clear(key) {
    delete vm[key];
  };

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.onSelectCurrency = (currencyId) => {
    vm.reportDetails.currency_id = currencyId;
    vm.currency_id = currencyId;
    formatData();
  };

  function formatData() {
    const params = {
      depot_uuid : vm.depot.uuid,
      dateTo : vm.dateTo,
      currency_id : vm.currency_id,
    };
    cache.reportDetails = angular.copy(params);
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
