angular.module('bhima.controllers')
  .controller('VoucherController', VoucherController);

// dependencies injection
VoucherController.$inject = [
  'VoucherService', 'NotifyService', 'GridFilteringService', 'uiGridGroupingConstants', 'uiGridConstants',
  'bhConstants', 'ReceiptModal', 'GridSortingService', '$state', 'appcache',
  'DepricatedFilterService',
];

/**
 * Vouchers Registry Controller
 *
 * @description
 * This controller is responsible for display all vouchers in the voucher table.
 */
function VoucherController(Vouchers, Notify, Filtering, uiGridGroupingConstants,
  uiGridConstants, bhConstants, Receipts, Sorting, $state, AppCache,
  Filters) {
  var vm = this;
  var cache = new AppCache('VoucherRegistry');

  var filter = new Filters();
  var filtering;
  var FILTER_BAR_HEIGHT;

  var INCOME = bhConstants.transactionType.INCOME;
  var EXPENSE = bhConstants.transactionType.EXPENSE;
  var OTHER = bhConstants.transactionType.OTHER;

  /* global variables */
  vm.filter = filter;
  vm.filterEnabled = false;
  vm.transactionTypes = {};
  vm.gridApi = {};
  vm.gridOptions = {};
  vm.search = search;
  vm.toggleFilter = toggleFilter;
  vm.onRemoveFilter = onRemoveFilter;
  vm.clearFilters = clearFilters;

  vm.loading = false;

  FILTER_BAR_HEIGHT = bhConstants.grid.FILTER_BAR_HEIGHT;

  // init the filter service
  filtering = new Filtering(vm.gridOptions);

  vm.gridOptions = {
    appScopeProvider : vm,
    showColumnFooter : true,
    flatEntityAccess : true,
    fastWatch        : true,
    enableFiltering  : vm.filterEnabled,
  };

  // grid default options
  vm.gridOptions.columnDefs = [{
    field                : 'reference',
    displayName          : 'TABLE.COLUMNS.REFERENCE',
    headerCellFilter     : 'translate',
    cellTemplate         : 'partials/vouchers/templates/uuid.tmpl.html',
    treeAggregationType  : uiGridGroupingConstants.aggregation.COUNT,
    sortingAlgorithm     : Sorting.algorithms.sortByReference,
    treeAggregationLabel : '',
  }, {
    field                       : 'type_id',
    displayName                 : 'TABLE.COLUMNS.TYPE',
    headerCellFilter            : 'translate',
    cellTemplate                : 'modules/templates/grid/voucherType.tmpl.html',
    treeAggregationType         : uiGridGroupingConstants.aggregation.SUM,
    treeAggregationLabel        : '',
    groupingShowAggregationMenu : false,
  }, {
    field                       : 'date',
    displayName                 : 'TABLE.COLUMNS.DATE',
    headerCellFilter            : 'translate',
    cellFilter                  : 'date',
    filter                      : { condition: filtering.filterByDate },
    type                        : 'date',
    groupingShowAggregationMenu : false,
  }, {
    field                       : 'description',
    displayName                 : 'TABLE.COLUMNS.DESCRIPTION',
    headerCellFilter            : 'translate',
    groupingShowAggregationMenu : false,
  }, {
    field                       : 'amount',
    displayName                 : 'TABLE.COLUMNS.AMOUNT',
    headerCellFilter            : 'translate',
    treeAggregationType         : uiGridGroupingConstants.aggregation.SUM,
    treeAggregationLabel        : '',
    footerCellClass             : 'text-right',
    type                        : 'number',
    groupingShowAggregationMenu : false,
    cellTemplate                : 'modules/vouchers/templates/amount.grid.tmpl.html',
  }, {
    field                       : 'display_name',
    displayName                 : 'TABLE.COLUMNS.RESPONSIBLE',
    headerCellFilter            : 'translate',
    groupingShowAggregationMenu : false,
  }, {
    field            : 'action',
    displayName      : '...',
    enableFiltering  : false,
    enableColumnMenu : false,
    enableSorting    : false,
    cellTemplate     : 'modules/vouchers/templates/action.cell.html',
  }];

  // register API
  vm.gridOptions.onRegisterApi = onRegisterApi;

  // expose function
  vm.get = get;
  vm.isDefined = isDefined;
  vm.showReceipt = showReceipt;
  vm.bhConstants = bhConstants;

  // API register function
  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // isDefined Type
  function isDefined(row) {
    return row.uuid && (row.type_id === null || row.type_id === undefined);
  }

  // get vouchers transaction
  function get(originId) {
    if (originId === null || originId === undefined) { return {}; }
    return vm.transactionTypes.get(originId);
  }

  // enable filter
  function toggleFilter() {
    vm.gridOptions.enableFiltering = vm.filterEnabled = !vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  // search voucher
  function search() {
    Vouchers.openSearchModal(vm.filters)
      .then(function (parameters) {
        if (!parameters) { return; }

        if (parameters.defaultPeriod) {
          delete parameters.defaultPeriod;
        }

        cacheFilters(parameters);
        return load(vm.filters);
      });
  }

  // showReceipt
  function showReceipt(uuid) {
    Receipts.voucher(uuid);
  }

  function isEmpty(object) {
    return Object.keys(object).length === 0;
  }

  function load(parameters) {
    // flush error and loading states
    vm.hasError = false;
    toggleLoadingIndicator();

    Vouchers.read(null, parameters).then(function (vouchers) {
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


  // save the parameters to use later.  Formats the parameters in filtersFmt for the filter toolbar.
  function cacheFilters(filters) {
    filters = filter.applyDefaults(filters);
    vm.filters = cache.filters = filters;
    vm.filtersFmt = Vouchers.formatFilterParameters(filters);

    // show filter bar as needed
    vm.filterBarHeight = (vm.filtersFmt.length > 0) ? FILTER_BAR_HEIGHT : {};
  }

  // remove a filter with from the filter object, save the filters and reload
  function onRemoveFilter(key) {
    delete vm.filters[key];
    cacheFilters(vm.filters);
    load(vm.filters);
  }

  // clears the filters by forcing a cache of an empty array
  function clearFilters() {
    cacheFilters({});
    load(vm.filters);
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
    Vouchers.transactionType()
      .then(function (store) {
        vm.transactionTypes = store;
      })
      .catch(Notify.handleError);

    if ($state.params.filters) {
      cacheFilters($state.params.filters);
    }
    cacheFilters({});

    vm.filters = cache.filters;
    vm.filtersFmt = Vouchers.formatFilterParameters(vm.filters || {});
    load(vm.filters);
  }

  startup();
}
