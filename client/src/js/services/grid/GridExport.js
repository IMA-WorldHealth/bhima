angular.module('bhima.services')
  .service('GridExportService', GridExportService);

GridExportService.$inject = ['$uibModal', 'util'];

function GridExportService(Modal, util) {

  /**
   * @constructor
   */
  function GridExport(gridOptions, defaultRowKey, defaultColKey) {

    this.gridOptions = gridOptions;
    this.ROWS = defaultRowKey;
    this.COLS = defaultColKey;

    util.after(gridOptions, 'onRegisterApi', function onRegisterApi(api) {
      this.api = api;
    }.bind(this));
  }

  /**
   * @method run
   * @description run the export tool
   */
  GridExport.prototype.run = function run() {
    var gridApi = this.api;
    var gridOptions = this.gridOptions;
    var rows = this.ROWS;
    var cols = this.COLS;

    var request = {
      api: gridApi,
      options: gridOptions,
      rows: rows,
      cols: cols,
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
  }

  return GridExport;
}
