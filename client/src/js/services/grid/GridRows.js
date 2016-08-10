angular.module('bhima.services')
  .service('GridRowService', GridRowService);

GridRowService.$inject = ['util'];

/**
 * @module services/grid/GridRowService
 *
 * @description
 *
 * This service is usefull to manage some aspect of rows such as selection
 * It is used to manage the row selection and to help the trial balance to
 * Guest the number of row to post
 */

function GridRowService(util) {

  /** @const cache alias for this service */
  var serviceKey = '-Rows';
  
  /**
   * @function Rows
   *
   * @description
   * The constructor of the GridRowsService.  It is called with the
   * gridOptions
   */
  function Rows(gridOptions) {

    var self = this;

    // bind access to the gridOptions
    this.gridOptions = gridOptions;
    this.selectedRowCount = 0;

    // bind the exposed grid API
    util.after(gridOptions, 'onRegisterApi', function onRegisterApi(api) {
      this.gridApi = api;

      api.selection.on.rowSelectionChanged(null, function(row){
        self.selectedRowCount = api.selection.getSelectedCount();
      }.bind(this));

      api.selection.on.rowSelectionChangedBatch(null, function(rows){
        self.selectedRowCount = api.selection.getSelectedCount();
      }.bind(this));

    }.bind(this));
  }

  return Rows;
}
