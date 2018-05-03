angular.module('bhima.services')
  .service('GridExportService', GridExportService);

GridExportService.$inject = [
  '$uibModal', 'util', 'bhConstants',
  'uiGridExporterService', 'moment',
];

function GridExportService(Modal, util, bhConstants, uiGridExporterService, moment) {
  /**
   * @constructor
   */
  function GridExport(gridOptions, defaultRowKey, defaultColKey) {
    this.options = gridOptions;
    this.rows = defaultRowKey;
    this.cols = defaultColKey;

    // bind gridOptions to instance
    this.options = gridOptions;

    util.after(gridOptions, 'onRegisterApi', api => {
      this.api = api;
    });
  }

  /**
   * @method run
   *
   * @description run the export tool
   *
   * NOTE(@jniles) - any function using "this" cannot be an arrow function.
   */
  GridExport.prototype.run = function run() {
    const {
      api,
      options,
      rows,
      cols,
    } = this;

    const params = {
      templateUrl  : 'modules/templates/modals/export.modal.html',
      controller   : 'ExportGridModalController',
      controllerAs : '$ctrl',
      size         : 'md',
      backdrop     : 'static',
      animation    : false,
      resolve      : {
        data : () => ({
          api,
          options,
          rows,
          cols,
        }),
      },
    };

    const instance = Modal.open(params);
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
    let columns = this.options.columnDefs || [];
    let rows = this.options.data || [];

    if (columnsFormatterFn) {
      columns = columnsFormatterFn(this.options.columnDefs);
    }

    if (rowsFormatterFn) {
      rows = rowsFormatterFn(this.options.data);
    }

    const prefix = filename || 'Export_';
    const _fileName = String(prefix).concat(moment().format(bhConstants.dates.formatDB), '.csv');
    const fileString = uiGridExporterService.formatAsCsv(columns, rows, ',');
    uiGridExporterService.downloadFile(_fileName, fileString, true, true);
  };

  return GridExport;
}
