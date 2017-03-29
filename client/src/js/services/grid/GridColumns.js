angular.module('bhima.services')
.service('GridColumnService', GridColumnService);

GridColumnService.$inject = [
  'uiGridConstants', 'AppCache', '$uibModal', 'util', '$timeout'
];

/**
 * @module services/grid/GridColumnService
 *
 * @description
 * This service is responsible for setting up the column show/hiding on a
 * ui-grid.  When the service is first initialized, the default visibility is
 * inferred from the grid columns (on grid rendering).  If a cache exists for
 * the grid, the grid's column are loaded from the cache.
 *
 * At any point, a module (usually a modal) can call instance.resetDefaults()
 * to restore the default column rendering from the grid.
 *
 * @todo - investigate using ui-grid-saveState for caching the column
 */
function GridColumnService(uiGridConstants, AppCache, Modal, util, $timeout) {

  /** @const cache alias for this service */
  var serviceKey = '-Columns';

  /**
   * @method cacheDefaultColumnVisibility
   *
   * @description
   * Called once in the constructor of the column service.  It digests the
   * grid's columns and sets the default visibility object.
   *
   * @param {Object} api - the ui-grid's api passed in from rowsRendered()
   *
   * @private
   */
  function cacheDefaultColumnVisibility(api) {
    // ensure that this method doesn't get called multiple times by checking if
    // this.defaults is set.
    if (Object.keys(this.defaults).length > 0) { return; }

    var defaults = this.defaults;
    var cache = this.cache;

    angular.forEach(this.gridOptions.columnDefs, function (defn) {
      var field = defn.field;

      // only use the fields have usable names
      if (field) {
        var column = api.grid.getColumn(field);

        // cache the default visible value
        defaults[field] = column.visible;
      }
    });

    // if there is a cache defined, load it into the current view
    if (cache && Object.keys(cache).length > 0) {
      this.setVisibleColumns(cache);
    }
  }

  /**
   * @method cacheColumnVisibility
   *
   * @description
   * Called to cache the column selection whenever the selection is changed.
   * This is a private method that is only called from `setVisibleColumns()`.
   *
   * @param {Object} columns - the column mapping to be stored in local storage.
   *
   * @private
   */
  function cacheColumnVisibility(columns) {
    angular.merge(this.cache, columns);
  }

  /**
   * @function Columns
   *
   * @description
   * The constructor of the GridColumnsService.  It is called with the
   * gridOptions and a cacheKey to determine where to store the column
   * visibility selection for future page refreshes.
   */
  function Columns(gridOptions, cacheKey) {

    // set up local storage for selected grid columns
    if (cacheKey) {
      this.cache = AppCache(cacheKey + serviceKey);
    }


    // bind access to the gridOptions
    this.gridOptions = gridOptions;

    this.defaults = {};

    // bind the exposed grid API
    util.after(gridOptions, 'onRegisterApi', function onRegisterApi(api) {
      this.gridApi = api;

      // when the rendering is complete, cache the default column visibility
      api.core.on.rowsRendered(null, cacheDefaultColumnVisibility.bind(this));
    }.bind(this));
  }

  /**
   * @method setVisibleColumns
   *
   * @description
   * This method takes a map of fields -> visibility and sets the column visibility
   * based on that.  It redraws the grid once all columns have been toggled.
   *
   * @param {object} columns - a mapping of field names to boolean visibility values
   */
  Columns.prototype.setVisibleColumns = function setVisibleColumns(columns) {
    var grid = this.gridApi.grid;

    angular.forEach(columns, function (visible, field) {
      var column = grid.getColumn(field);
      if (visible) {
        column.showColumn();
      } else {
        column.hideColumn();
      }
    });

    // store the selected columns in the cache
    if (this.cache) {
      cacheColumnVisibility.call(this, columns);
    }


    // redraw the grid
    this.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };


  /**
   * @method hasEnoughColumns
   *
   * @description
   * This structure is used to count the number of selected columns
   *
   */
  Columns.prototype.hasEnoughColumns = function hasEnoughColumns(columns) {
    var grid = this.gridApi.grid;
    var visibleColumn = 0;
    var defaultValueColumn = 3;
    var totalColumn = 0;

    angular.forEach(columns, function (visible, field) {
      var column = grid.getColumn(field);
      
      /**
        *This alternative structure checks if the first element of the grid is visible or not, 
        *finally to reinitialize the number of column by default
      */
      if((column.name === "treeBaseRowHeaderCol") && !visible){
        defaultValueColumn--;
      }

      if (visible) {
        visibleColumn++;
      }
      
    });

    // There are 'defaultValueColumn' elements that are initialized to true
    if(visibleColumn > defaultValueColumn){
      return true;
    } else {
      return false;
    }

  };


  /**
   * @method resetDefaultVisibility
   *
   * @description
   * Resets the column visibility to the original visibility defined in the
   * controller.
   */
  Columns.prototype.resetDefaultVisibility = function resetDefaultVisibility() {
    this.setVisibleColumns(this.defaults);
  };

  /**
   * @method getColumns
   *
   * @description
   * Utility method to allow columns to be shared around with other services
   * and/or controllers.
   *
   * @returns {Array} columns - an array of column definitions from the grid
   *   core.
   */
  Columns.prototype.getColumns = function getColumns() {
    return this.gridApi.grid.columns;
  };

  /**
   * @method getColumnVisibilityMap
   *
   * @description
   * Utility method to get the visibility profile of grid columns.
   *
   * @returns {Object} map - a mapping of column field names to visibility status
   */
  Columns.prototype.getColumnVisibilityMap = function getColumnVisibilityMap() {
    return this.getColumns().reduce(function (map, column) {
      map[column.field] = column.visible;
      return map;
    }, {});
  };

  /**
   * @method openConfigurationModal
   *
   * @description
   * This class method allows any module to open a column configuration modal in
   * the context of their grid's column configuration.
   *
   * @returns {Promise} - resolve the modal's close/open state
   */
  Columns.prototype.openConfigurationModal = function openConfigurationModal() {
    var self = this;
    return Modal.open({
      templateUrl: 'modules/templates/modals/columnConfig.modal.html',
      controller:  'ColumnsConfigModalController as ColumnsConfigModalCtrl',
      size : 'lg',
      resolve : {
        Columns : function columnsProvider() { return self; }
      }
    });
  };

  return Columns;
}