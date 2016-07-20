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

  /** @const renders any currencied amount */
  var DEFAULT_COST_AGGREGATOR = {

    // used to render amounts in the aggregate columns
    // TODO - this should render the currency from the row set.
    customTreeAggregationFinalizerFn : function amountRenderer(aggregation) {
      aggregation.rendered = $currency(aggregation.value, currencyId);
    },

    treeAggregationType : uiGridGroupingConstants.aggregation.SUM,
  };

  /** @const aggregates quantities as needed */
  var DEFAULT_QUANTITY_AGGREGATOR= {
    treeAggregationType : uiGridGroupingConstants.aggregation.SUM,
  };

  /** @const aggregators assigned by column ids */
  var DEFAULT_AGGREGATORS = {
    'debit_equiv' : DEFAULT_COST_AGGREGATOR,
    'credit_equiv' : DEFAULT_COST_AGGREGATOR,
    'cost' : DEFAULT_COST_AGGREGATOR,
    'quantity' : DEFAULT_QUANTITY_AGGREGATOR,
    'amount' : DEFAULT_QUANTITY_AGGREGATOR
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

    // bind the group selection method
    gridApi.selection.on.rowSelectionChanged(null, selectAllGroupElements.bind(this));

    // hook into rows rendered call to ensure the grid is ready before expanding initial nodes
    gridApi.core.on.rowsRendered(null, util.once(function () {
      gridApi.grouping.groupColumn('trans_id');

      // for the expandAllRows() to be fired last
      $timeout(gridApi.treeBase.expandAllRows, 0, false);
    }));
  }

  function GridGrouping(gridOptions) {
    var cacheGridApi = gridOptions.onRegisterApi;

    // global grouping configuration
    gridOptions.enableGroupHeaderSelection = true;
    gridOptions.treeRowHeaderAlwaysVisible = false;

    // register for the grid API
    gridOptions.onRegisterApi = function onRegisterApi(api) {
      this.gridApi = api;

      // attach custom renderers
      configureDefaultAggregators(gridOptions.columnDefs);

      // configure default grouping
      configureDefaultGroupingOptions(api);

      // call the method that had previously been registered to request the grid's API
      if (angular.isDefined(cacheGridApi)) {
        cacheGridApi(api);
      }
    }.bind(this);
  }


  return GridGrouping;
}
