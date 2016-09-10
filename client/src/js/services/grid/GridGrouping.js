angular.module('bhima.services')
.service('GridGroupingService', GridGroupingService);

GridGroupingService.$inject = [
  'uiGridGroupingConstants', '$filter', 'SessionService', '$timeout', 'util'
];

/**
 * Grid Grouping Service
 *
 * This service is responsible for setting the grouping configuration for the
 * client side posting journal module. It also provides a number of helper
 * methods that can be used to provide custom transaction grouping.
 */
function GridGroupingService(uiGridGroupingConstants, $filter, Session, $timeout, util) {

  // cache the enterprise currency id for easy lookup
  var currencyId = Session.enterprise.currency_id;

  // cache the currency filter for later lookup
  var $currency = $filter('currency');

  // alias copy
  var copy = angular.copy;

  /** @const renders any currencied amount */
  var DEFAULT_COST_AGGREGATOR = {

    // used to render amounts in the aggregate columns
    // TODO - this should render the currency from the row set.
    customTreeAggregationFinalizerFn : function (aggregation) {
      aggregation.rendered = $currency(aggregation.value, currencyId);
    },

    treeAggregationType : uiGridGroupingConstants.aggregation.SUM,
  };

  /** @const aggregates quantities as needed */
  var DEFAULT_QUANTITY_AGGREGATOR = {
    treeAggregationType : uiGridGroupingConstants.aggregation.SUM,
  };

  /** @const aggregates by choosing a single item to display */
  /** @todo - this currently defaults to MAX, should be implemented as its own custom aggregator */
  var DEFAULT_SINGLE_AGGREGATOR = {
    treeAggregationType: uiGridGroupingConstants.aggregation.MAX,
    customTreeAggregationFinalizerFn: function (aggregation) {
      aggregation.rendered = aggregation.value;
    }
  };

  /** @const aggregators assigned by column ids */
  var DEFAULT_AGGREGATORS = {
    'debit_equiv' : copy(DEFAULT_COST_AGGREGATOR),
    'credit_equiv' : copy(DEFAULT_COST_AGGREGATOR),
    'cost' : copy(DEFAULT_COST_AGGREGATOR),
    'quantity' : copy(DEFAULT_QUANTITY_AGGREGATOR),
    'amount' : copy(DEFAULT_QUANTITY_AGGREGATOR),
    'description' : copy(DEFAULT_SINGLE_AGGREGATOR),
    'date' : copy(DEFAULT_SINGLE_AGGREGATOR),
    'trans_date' : copy(DEFAULT_SINGLE_AGGREGATOR), // TODO - eliminate this in favor of "date"
  };

  /**
   * @method configureDefaultAggregators
   *
   * @description
   * Certain columns will always be aggregated in certain ways.  For example,
   * debit and credit fields should always be summed, no matter scenario.  This
   * function will scan the grid columns for common fields and provide pre-made
   * aggregators for those columns.
   *
   * @param {Object} columns - the columns object from the gridOptions
   *
   * @private
   */
  function configureDefaultAggregators(columns) {
    columns.forEach(function (column) {
      var aggregator = DEFAULT_AGGREGATORS[column.field];

      if (aggregator) {
        column.treeAggregationType = aggregator.treeAggregationType;
        column.customTreeAggregationFinalizerFn = aggregator.customTreeAggregationFinalizerFn;
      }
    });
  }


  /**
   * @method selectAllGroupElements
   *
   * @description
   * This method enables group level selections when the posting journal is grouped
   * according to a column. It first checks to ensure the row that changed is a
   * header and then selects each of the rows children.
   *
   * @param {object} rowChanged    Object containing the row that has just been selected
   *
   * @private
   */
  function selectAllGroupElements(rowChanged) {
    var gridApi = this.gridApi;

    this.selectedRowCount = gridApi.selection.getSelectedCount();

    // determine that this selection is a header row
    if (angular.isDefined(rowChanged.treeLevel) && rowChanged.treeLevel > -1) {

      var children = gridApi.treeBase.getRowChildren(rowChanged);
      children.forEach(function (child) {

        // determine if we should we be selected or deselecting
        var select = rowChanged.isSelected ? gridApi.selection.selectRow : gridApi.selection.unSelectRow;
        select(child.entity);
      });
    }
  }

  function handleBatchSelection (){
    var gridApi = this.gridApi;
    this.selectedRowCount = gridApi.selection.getSelectedCount();
  }

  //handle the select batch event

  /**
   * @method configureDefaultGroupingOptions
   *
   * @description
   * This method binds grouping utility methods to UI grid API actions. It sets
   * up the default grouping functionality of the grid, specifically:
   *  - Selecting a header row will select all children elements
   *  - Grid transactions will be expanded on initialisation
   *
   * @param {object} gridApi     Angular UI Grid API
   *
   * @private
   */
  function configureDefaultGroupingOptions(gridApi) {

    //this instruction block can be executed if the grid involves selection functionality
    if(gridApi.selection){

      // bind the group selection method
      gridApi.selection.on.rowSelectionChanged(null, selectAllGroupElements.bind(this));

      gridApi.selection.on.rowSelectionChangedBatch(null, handleBatchSelection.bind(this));

    }

    // hook into rows rendered call to ensure the grid is ready before expanding initial nodes
    gridApi.core.on.rowsRendered(null, util.once(function () {
      gridApi.grouping.groupColumn(this.column);

      // for the expandAllRows() to be fired last
      unfoldAllGroups(gridApi);
    }.bind(this)));
  }

  function unfoldAllGroups(api) {
    $timeout(api.treeBase.expandAllRows, 0, false);
  }

  function changeGrouping (column) {
    this.gridApi.grouping.clearGrouping();
    this.gridApi.grouping.groupColumn(column);
    this.gridApi.grouping.aggregateColumn('debit_equiv', uiGridGroupingConstants.aggregation.SUM);
    this.gridApi.grouping.aggregateColumn('credit_equiv', uiGridGroupingConstants.aggregation.SUM);

    unfoldAllGroups(this.gridApi);
  }

  function removeGrouping () {
    this.gridApi.grouping.clearGrouping();
  }

  // return the current grouping
  function  getCurrentGroupingColumn () {
    var groupingDetail = this.gridApi.grouping.getGrouping();
    return groupingDetail.grouping[0].colName;
  }

  /** return back the list of selected rows **/

  function getSelectedRows (){
    return this.gridApi.selection.getSelectedGridRows();
  }

  /**
   * @constructor
   */
  function GridGrouping(gridOptions, isGroupHeaderSelectable, column) {

    /**
     * contains the number of selected rows
     * TODO : create a separate service to handle selection functionnality of the grid as grouping and selection are differents
     */
    this.selectedRowCount = 0;
    this.getSelectedRows = getSelectedRows.bind(this);
    this.changeGrouping = changeGrouping.bind(this);
    this.removeGrouping = removeGrouping.bind(this);
    this.getCurrentGroupingColumn = getCurrentGroupingColumn.bind(this);
    this.column = column || 'trans_id';
    this.gridOptions = gridOptions;

    // global grouping configuration
    gridOptions.enableGroupHeaderSelection = isGroupHeaderSelectable || true;
    gridOptions.treeRowHeaderAlwaysVisible = false;
    gridOptions.showTreeExpandNoChildren = false;

    util.after(gridOptions, 'onRegisterApi', function onRegisterApi(api) {
      this.gridApi = api;

      // attach custom renderer
      configureDefaultAggregators(gridOptions.columnDefs);

      // configure default grouping
      configureDefaultGroupingOptions.call(this, api);
    }.bind(this));
  }

  return GridGrouping;
}
