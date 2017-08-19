angular.module('bhima.controllers')
  .controller('VoucherController', VoucherController);

// dependencies injection
VoucherController.$inject = [
  'VoucherService', 'NotifyService', 'uiGridGroupingConstants', 'uiGridConstants',
  'bhConstants', 'ReceiptModal', 'GridSortingService', 'GridColumnService',
  'GridStateService', '$state',
];

/**
 * Vouchers Registry Controller
 *
 * @description
 * This controller is responsible for display all vouchers in the voucher table.
 */
function VoucherController(Vouchers, Notify, uiGridGroupingConstants,
  uiGridConstants, bhConstants, Receipts, Sorting, Columns, GridState, $state) {
  var vm = this;

  var cacheKey = 'voucher-grid';
  var gridColumns;
  var state;
  var columnDefs;

  var FILTER_BAR_HEIGHT = bhConstants.grid.FILTER_BAR_HEIGHT;
  var INCOME = bhConstants.transactionType.INCOME;
  var EXPENSE = bhConstants.transactionType.EXPENSE;
  var OTHER = bhConstants.transactionType.OTHER;

  /* global variables */
  vm.transactionTypes = {};
  vm.gridApi = {};
  vm.gridOptions = {};

  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.openColumnConfigModal = openColumnConfigModal;
  vm.clearGridState = clearGridState;
  vm.download = Vouchers.download;

  vm.loading = false;

  // grid default options
  var columnDefs = [{
    field: 'reference',
    displayName: 'TABLE.COLUMNS.REFERENCE',
    headerCellFilter: 'translate',
    cellTemplate: 'modules/vouchers/templates/uuid.tmpl.html',
    treeAggregationType: uiGridGroupingConstants.aggregation.COUNT,
    sortingAlgorithm: Sorting.algorithms.sortByReference,
    treeAggregationLabel: '',
  }, {
    field: 'type_id',
    displayName: 'TABLE.COLUMNS.TYPE',
    headerCellFilter: 'translate',
    cellTemplate: 'modules/templates/grid/voucherType.tmpl.html',
    treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
    treeAggregationLabel: '',
    groupingShowAggregationMenu: false,
  }, {
    field: 'date',
    displayName: 'TABLE.COLUMNS.DATE',
    headerCellFilter: 'translate',
    type: 'date',
    cellFilter: 'date:"mediumDate"',
    groupingShowAggregationMenu: false,
  }, {
    field: 'description',
    displayName: 'TABLE.COLUMNS.DESCRIPTION',
    headerCellFilter: 'translate',
    groupingShowAggregationMenu: false,
  }, {
    field: 'amount',
    displayName: 'TABLE.COLUMNS.AMOUNT',
    headerCellFilter: 'translate',
    treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
    treeAggregationLabel: '',
    footerCellClass: 'text-right',
    type: 'number',
    groupingShowAggregationMenu: false,
    cellTemplate: 'modules/vouchers/templates/amount.grid.tmpl.html',
  }, {
    field: 'display_name',
    displayName: 'TABLE.COLUMNS.RESPONSIBLE',
    headerCellFilter: 'translate',
    groupingShowAggregationMenu: false,
  }, {
    field: 'action',
    displayName: '...',
    enableFiltering: false,
    enableColumnMenu: false,
    enableSorting: false,
    cellTemplate: 'modules/vouchers/templates/action.cell.html',
  }];

  vm.gridOptions = {
    appScopeProvider: vm,
    showColumnFooter: true,
    enableColumnMenu: false,
    enableSorting: true,
    flatEntityAccess: true,
    fastWatch: true,
    columnDefs: columnDefs,
  };

  gridColumns = new Columns(vm.gridOptions, cacheKey);
  state = new GridState(vm.gridOptions, cacheKey);

  // expose function
  vm.get = get;
  vm.isDefined = isDefined;
  vm.showReceipt = showReceipt;
  vm.bhConstants = bhConstants;

  // isDefined Type
  function isDefined(row) {
    return row.uuid && (row.type_id === null || row.type_id === undefined);
  }

  // get vouchers transaction
  function get(originId) {
    if (originId === null || originId === undefined) { return {}; }
    return vm.transactionTypes.get(originId);
  }

  // search voucher
  function search() {
    var filtersSnapshot = Vouchers.filters.formatHTTP();

    Vouchers.openSearchModal(filtersSnapshot)
      .then(function (changes) {
        Vouchers.filters.replaceFilters(changes);
        Vouchers.cacheFilters();
        vm.latestViewFilters = Vouchers.filters.formatView();

        return load(Vouchers.filters.formatHTTP(true));
      })
      .catch(angular.noop);
  }

  // showReceipt
  function showReceipt(uuid) {
    Receipts.voucher(uuid);
  }

  function load(filters) {
    // flush error and loading states
    vm.hasError = false;
    toggleLoadingIndicator();

    Vouchers.read(null, filters).then(function (vouchers) {
      vm.gridOptions.data = vouchers;

      // loop through the vouchers and precompute the voucher type tags
      vouchers.forEach(function (voucher) {
        var transaction = get(voucher.type_id);
        voucher._isIncome = (transaction.type === INCOME);
        voucher._isExpense = (transaction.type === EXPENSE);
        voucher._isOther = (transaction.type === OTHER);
        voucher._type = transaction.text;
      });

      vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
    })
      .catch(function (err) {
        if (err && !err.code) { return; }
        Notify.handleError(err);
      })
      .catch(errorHandler)
      .finally(function () {
        toggleLoadingIndicator();
      });
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

    Vouchers.transactionType()
      .then(function (store) {
        vm.transactionTypes = store;
      })
      .catch(Notify.handleError);

    load(Vouchers.filters.formatHTTP(true));
    vm.latestViewFilters = Vouchers.filters.formatView();
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
