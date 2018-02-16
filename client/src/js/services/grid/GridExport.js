angular.module('bhima.services')
  .service('GridExportService', GridExportService);

GridExportService.$inject = [
  '$uibModal', 'util', 'bhConstants',
  'uiGridExporterService', 'moment',
];

function GridExportService(Modal, util, bhConstants, uiGridExporterService, moment) {
  const service = this;

  /**
   * @constructor
   */
  function GridExport(gridOptions, defaultRowKey, defaultColKey) {
    this.options = gridOptions;
    this.rows = defaultRowKey;
    this.cols = defaultColKey;

    // bind gridOptions to service
    service.options = gridOptions;

    util.after(gridOptions, 'onRegisterApi', function onRegisterApi(api) {
      this.api = api;
    }.bind(this));
  }

  /**
   * @method run
   * @description run the export tool
   */
  GridExport.prototype.run = () => {
    const { api } = this;
    const { options } = this;
    const { rows } = this;
    const { cols } = this;

    var request = {
      api, options, rows, cols,
    };

    var params = {
      templateUrl  : 'modules/templates/modals/export.modal.html',
      controller   : 'ExportGridModalController',
      controllerAs : '$ctrl',
      size         : 'md',
      backdrop     : 'static',
      animation    : false,
      resolve      : {
        data : function dataProvider() { return request; },
      },
    };

    var instance = Modal.open(params);
    return instance.result;
  };


  /**
   * @method exportToCsv
   *
   * @description export the grid content into a csv file
   *
   * @param {string} filename - [optional] The name of the csv file
   * @param {function} rowsFormatterFn - [optional] callback fn to apply to rows
   * @param {function} columnsFormatterFn - [optional] callback fn to apply to columns
   */
  GridExport.prototype.exportToCsv = (filename, columnsFormatterFn, rowsFormatterFn) => {
    var columns = service.options.columnDefs || [];
    var rows = service.options.data || [];

    if (columnsFormatterFn) {
      columns = columnsFormatterFn(service.options.columnDefs);
    }

    if (rowsFormatterFn) {
      rows = rowsFormatterFn(service.options.data);
    }

    const prefix = filename || 'Export_';
    const _fileName = String(prefix).concat(moment().format(bhConstants.dates.formatDB), '.csv');
    const fileString = uiGridExporterService.formatAsCsv(columns, rows, ',');
    uiGridExporterService.downloadFile(_fileName, fileString, true, true);
  };

  return GridExport;
}
