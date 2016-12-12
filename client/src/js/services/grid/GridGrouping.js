angular.module('bhima.services')
  .service('GridGroupingService', GridGroupingService);

GridGroupingService.$inject = [
  'GridAggregatorService', 'uiGridGroupingConstants', 'SessionService',  '$timeout', 'util'
];

/**
 * Grid Grouping Service
 *
 * This service is responsible for setting the grouping configuration for the
 * client side posting journal module. It also provides a number of helper
 * methods that can be used to provide custom transaction grouping.
 *
 * @TODO This service should not perform grouping on columns that are not specified
 * in the `gridOptions`. There are too many places for this to be defined with this
 * set up.
 */
function GridGroupingService(GridAggregators, uiGridGroupingConstants, Session, $timeout, util) {

  /** @const aggregators assigned by column ids */
  var DEFAULT_AGGREGATORS = GridAggregators.aggregators.tree;
  // var DEFAULT_AGGREGATORS = {
  //   // 'debit_equiv' : copy(DEFAULT_COST_AGGREGATOR),
  //   // 'credit_equiv' : copy(DEFAULT_COST_AGGREGATOR),
  //   'cost' : copy(DEFAULT_COST_AGGREGATOR),
  //   'quantity' : copy(DEFAULT_QUANTITY_AGGREGATOR),
  //   'amount' : copy(DEFAULT_QUANTITY_AGGREGATOR),
  //   'description' : copy(DEFAULT_SINGLE_AGGREGATOR),
  //   'date' : copy(DEFAULT_SINGLE_AGGREGATOR),
  //   'trans_date' : copy(DEFAULT_SINGLE_AGGREGATOR), // TODO - eliminate this in favor of "date"
  // };

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
    console.log('called ');
    columns.forEach(function (column) {
      var aggregator = DEFAULT_AGGREGATORS[column.field];

      if (aggregator) {
        GridAggregators.extendColumnWithAggregator(column, aggregator);
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

  // handle the select batch event

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
			console.log('applying initial group column');
      gridApi.grouping.groupColumn(this.column);
      // configureDefaultAggregators(gridApi.grid.columns);
      groupByTransactionView(gridApi);

      // for the expandAllRows() to be fired last
      // unfoldAllGroups(gridApi);
    }.bind(this)));
  }

	function groupByTransactionView(gridApi) {
    var fieldKey = 'trans_id';
    gridApi.grouping.groupColumn(fieldKey);

    // set the header row text for grouped element
    gridApi.grid.columns.some(function (column) {
      if (column.grouping && column.grouping.groupPriority > -1) {

        console.log('grouping rule applies');
        column.treeAggregationFn = function (aggregation, fieldValue, numValue, row) {
          // @todo this will be called for every row in a group but only needs to be called once
          aggregation.value = row.entity.transaction.debit_equiv;
        };

        column.customTreeAggregationFinalizerFn = function (aggregation) {
          if (typeof(aggregation.groupVal) !== 'undefined') {
            aggregation.rendered = aggregation.groupVal + ' (' + aggregation.value + ')';
          } else {
            aggregation.rendered = null;
          }
        };

        return true;
      }
      return false;
    });
	}

  function unfoldAllGroups(api) {
    $timeout(api.treeBase.expandAllRows, 0, false);
  }

  function changeGrouping (column) {
    this.gridApi.grouping.clearGrouping();
    this.gridApi.grouping.groupColumn(column);
    // this.gridApi.grouping.aggregateColumn('debit_equiv', uiGridGroupingConstants.aggregation.SUM);
    // this.gridApi.grouping.aggregateColumn('credit_equiv', uiGridGroupingConstants.aggregation.SUM);

    unfoldAllGroups(this.gridApi);
  }

  function removeGrouping () {
    try {
      this.gridApi.grouping.clearGrouping();
    } catch (e) { }
  }

  // return the current grouping
  function  getCurrentGroupingColumn () {
    var groupingDetail = this.gridApi.grouping.getGrouping();
    return groupingDetail.grouping[0].colName;
  }

  /**
   * return back the list of selected rows,
   * if one row is selected so all transaction row will be considered as selected
   * TO DO : make it generic, any kind of group should used, not only trans_id
   **/
  function getSelectedGroups (){

    var parsed = [], processedTransactions = [];
    var records = this.gridApi.selection.getSelectedGridRows();

    records.forEach(function (record){

      if(processedTransactions.indexOf(record.entity.trans_id) === -1){

        //take other children of the parent so that every line of the transaction will be present
        parsed = parsed.concat(record.treeNode.parentRow.treeNode.children.map(function (child){
          return child.row.entity;
        }));

        processedTransactions.push(record.entity.trans_id);
      }
    });

    return parsed;
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
    this.getSelectedGroups = getSelectedGroups.bind(this);
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

      // attach custom renderers
      configureDefaultAggregators(gridOptions.columnDefs);

      // configure default grouping
      configureDefaultGroupingOptions.call(this, api);
    }.bind(this));
  }

  return GridGrouping;
}
