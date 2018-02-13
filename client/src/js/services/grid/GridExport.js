angular.module('bhima.services')
  .service('GridExportService', GridExportService);

GridExportService.$inject = ['$uibModal', 'util'];

function GridExportService(Modal, util) {

  /**
   * @constructor
   */
  function GridExport(gridOptions, defaultRowKey, defaultColKey) {

    this.options = gridOptions;
    this.rows = defaultRowKey;
    this.cols = defaultColKey;

    util.after(gridOptions, 'onRegisterApi', function onRegisterApi(api) {
      this.api = api;
    }.bind(this));
  }

  /**
   * @method run
   * @description run the export tool
   */
  GridExport.prototype.run = function run() {
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

  return GridExport;
}
