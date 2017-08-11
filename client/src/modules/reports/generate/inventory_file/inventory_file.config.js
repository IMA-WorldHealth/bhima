angular.module('bhima.controllers')
  .controller('inventory_fileController', InventoryFileConfigController);

InventoryFileConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state',
  'LanguageService', 'moment',
];

function InventoryFileConfigController($sce, Notify, SavedReports, AppCache, reportData, $state,
  Languages, moment) {
  var vm = this;
  var cache = new AppCache('configure_inventory_file_report');
  var reportUrl = 'reports/stock/inventory';

  vm.previewGenerated = false;

  vm.dateTo = new Date();

  // chech cached configuration
  checkCachedConfiguration();

  vm.onSelectDepot = function onSelectDepot(depot) {
    vm.depot = depot;
  };

  vm.onSelectInventory = function onSelectInventory(inventory) {
    vm.inventory = inventory;
  };

  vm.clear = function clear(key) {
    delete vm[key];
  };

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  vm.preview = function preview(form) {
    var options;
    var params;

    if (form.$invalid) { return 0; }

    params = {
      depot_uuid : vm.depot.uuid,
      inventory_uuid : vm.inventory.uuid,
      dateTo : vm.dateTo,
    };

     // update cached configuration
    cache.reportDetails = angular.copy(params);

    // format date for the server
    params.dateTo = moment(params.dateTo).format('YYYY-MM-DD');

    options = {
      params : params,
      lang : Languages.key,
    };

    vm.reportDetails = options;

    return SavedReports.requestPreview(reportUrl, reportData.id, angular.copy(vm.reportDetails))
      .then(function (result) {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
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

  function checkCachedConfiguration() {
    vm.reportDetails = angular.copy(cache.reportDetails || {});
  }
}
