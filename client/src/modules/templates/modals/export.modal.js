angular.module('bhima.controllers')
  .controller('ExportGridModalController', ExportGridModalController);

ExportGridModalController.$inject = [
  '$uibModalInstance', 'uiGridConstants', '$filter',
  'moment', 'bhConstants', 'data',
];

function ExportGridModalController(Instance, uiGridConstants, $filter,
  moment, bhConstants, Data) {
  var vm = this;

  var gridOptions = Data.options || {};
  var gridApi = Data.api || {};
  var filename = Data.filename || 'Export ' + moment().format('YYYY-MM-DD');
  var ROWS = Data.rows || 'visible';
  var COLS = Data.cols || 'visible';

  // bind with view
  vm.exportColType = COLS;
  vm.exportRowType = ROWS;

  // expose to the view
  vm.exportGrid = exportGrid;
  vm.dismiss = Instance.dismiss;

  /**
   * Export to csv
   */
  function exportGrid() {
    var myElement = angular.element(document.querySelectorAll('.ui-grid-exporter-csv-link'));
    filename = vm.filename || filename;
    gridOptions.exporterCsvFilename = filename.concat('.csv');
    gridOptions.exporterHeaderFilter = exporterHeaderFilter;
    gridOptions.exporterOlderExcelCompatibility = true;
    gridApi.exporter.csvExport(vm.exportRowType, vm.exportColType, myElement);
    Instance.close(true);
  }

  /**
   * Exporter apply header filter
   */
  function exporterHeaderFilter(displayName) {
    return $filter('translate')(displayName);
  }
}
