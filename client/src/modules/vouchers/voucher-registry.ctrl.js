angular.module('bhima.controllers')
  .controller('VoucherController', VoucherController);

// dependencies injection
VoucherController.$inject = [
  'VoucherService', 'NotifyService', 'uiGridGroupingConstants', 'TransactionTypeService',
  'uiGridConstants', 'bhConstants', 'ReceiptModal', 'GridSortingService', 'GridColumnService',
  'GridStateService', '$state',
];

/**
 * Vouchers Registry Controller
 *
 * @description
 * This controller is responsible for display all vouchers in the voucher table as a
 * registry.  The registry supports client-side filtering, server-side searching, column
 * reordering, and many more features.
 */
function VoucherController(
  Vouchers, Notify, uiGridGroupingConstants, TransactionTypes,
  uiGridConstants, bhConstants, Receipts, Sorting, Columns, GridState, $state
) {
  var vm = this;

  var cacheKey = 'voucher-grid';
  var gridColumns;
  var state;
  var columnDefs;

  var transactionTypeMap = {};

  var INCOME = bhConstants.transactionType.INCOME;
  var EXPENSE = bhConstants.transactionType.EXPENSE;

  vm.gridOptions = {};

  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.openColumnConfigModal = openColumnConfigModal;
  vm.clearGridState = clearGridState;
  vm.download = Vouchers.download;

  vm.loading = false;

  // grid default options
  columnDefs = [{
    field : 'reference',
    displayName : 'TABLE.COLUMNS.REFERENCE',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/vouchers/templates/uuid.tmpl.html',
    treeAggregationType : uiGridGroupingConstants.aggregation.COUNT,
    sortingAlgorithm : Sorting.algorithms.sortByReference,
    treeAggregationLabel : '',
  }, {
    field : 'type_id',
    displayName : 'TABLE.COLUMNS.TYPE',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/templates/grid/voucherType.tmpl.html',
    treeAggregationType : uiGridGroupingConstants.aggregation.SUM,
    treeAggregationLabel : '',
    groupingShowAggregationMenu : false,
  }, {
    field : 'date',
    displayName : 'TABLE.COLUMNS.DATE',
    headerCellFilter : 'translate',
    type : 'date',
    cellFilter : 'date :"mediumDate"',
    groupingShowAggregationMenu : false,
  }, {
    field : 'description',
    displayName : 'TABLE.COLUMNS.DESCRIPTION',
    headerCellFilter : 'translate',
    groupingShowAggregationMenu : false,
  }, {
    field : 'amount',
    displayName : 'TABLE.COLUMNS.AMOUNT',
    headerCellFilter : 'translate',
    treeAggregationType : uiGridGroupingConstants.aggregation.SUM,
    treeAggregationLabel : '',
    footerCellClass : 'text-right',
    type : 'number',
    groupingShowAggregationMenu : false,
    cellTemplate : 'modules/vouchers/templates/amount.grid.tmpl.html',
  }, {
    field : 'display_name',
    displayName : 'TABLE.COLUMNS.RESPONSIBLE',
    headerCellFilter : 'translate',
    groupingShowAggregationMenu : false,
  }, {
    field : 'action',
    displayName : '...',
    enableFiltering : false,
    enableColumnMenu : false,
    enableSorting : false,
    cellTemplate : 'modules/vouchers/templates/action.cell.html',
  }];

  vm.gridOptions = {
    appScopeProvider : vm,
    showColumnFooter : true,
    enableColumnMenu : false,
    enableSorting : true,
    flatEntityAccess : true,
    fastWatch : true,
    columnDefs : columnDefs,
  };

  gridColumns = new Columns(vm.gridOptions, cacheKey);
  state = new GridState(vm.gridOptions, cacheKey);

  // expose function
  vm.showReceipt = showReceipt;
  vm.bhConstants = bhConstants;

  // search voucher
  function search() {
    var filtersSnapshot = Vouchers.filters.formatHTTP();

    Vouchers.openSearchModal(filtersSnapshot)
      .then(function (changes) {
        Vouchers.filters.replaceFilters(changes);
        Vouchers.cacheFilters();
        vm.latestViewFilters = Vouchers.filters.formatView();

        return load(Vouchers.filters.formatHTTP(true));
      });
  }

  // showReceipt
  function showReceipt(uuid) {
    Receipts.voucher(uuid);
  }

  function load(filters) {
    // flush error and loading states
    vm.hasError = false;
    toggleLoadingIndicator();

    Vouchers.read(null, filters)
      .then(function (vouchers) {
        vm.gridOptions.data = vouchers;

        vouchers.forEach(function (voucher) {
          var transactionType;
          var isNull = (voucher.type_id === null);

          if (!isNull) {
            // determine the transaction_type for this voucher
            transactionType = transactionTypeMap[voucher.type_id];
            voucher._isIncome = (transactionType.type === INCOME);
            voucher._isExpense = (transactionType.type === EXPENSE);
            voucher._isOther = !(voucher._isIncome || voucher._isExpense);
            voucher._type = transactionType.text;
          }
        });
      })
      .catch(errorHandler)
      .finally(toggleLoadingIndicator);
  }

  // remove a filter with from the filter object, save the filters and reload
  function onRemoveFilter(key) {
    Vouchers.removeFilter(key);

    Vouchers.cacheFilters();
    vm.latestViewFilters = Vouchers.filters.formatView();

    return load(Vouchers.filters.formatHTTP(true));
  }

  /**
   * @function errorHandler
   *
   * @description
   * Uses Notify to show an error in case the server sends back an information.
   * Triggers the error state on the grid.
   */
  function errorHandler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  /**
   * @function toggleLoadingIndicator
   *
   * @description
   * Toggles the grid's loading indicator to eliminate the flash when rendering
   * transactions and allow a better UX for slow loads.
   */
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // initialize module
  function startup() {
    var changes;

    if ($state.params.filters.length) {
      changes = angular.copy($state.params.filters);

      Vouchers.filters.replaceFilters(changes);
      Vouchers.cacheFilters();
    }

    vm.latestViewFilters = Vouchers.filters.formatView();

    // before we can properly render the vouchers, we need to have
    // a transaction type mapping set up.
    TransactionTypes.read()
      .then(function (types) {
        // organize transaction types into a map
        types.forEach(function (type) {
          transactionTypeMap[type.id] = type;
        });

        return load(Vouchers.filters.formatHTTP(true));
      });
  }

  // This function opens a modal through column service to let the user toggle
  // the visibility of the voucher registry's columns.
  function openColumnConfigModal() {
    // column configuration has direct access to the grid API to alter the current
    // state of the columns - this will be saved if the user saves the grid configuration
    gridColumns.openConfigurationModal();
  }


  vm.saveGridState = state.saveGridState;
  // saves the grid's current configuration
  function clearGridState() {
    state.clearGridState();
    $state.reload();
  }

  startup();
}
