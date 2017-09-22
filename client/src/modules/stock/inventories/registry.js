angular.module('bhima.controllers')
.controller('StockInventoriesController', StockInventoriesController);

StockInventoriesController.$inject = [
  'StockService', 'NotifyService',
  'uiGridConstants', '$translate', 'StockModalService',
  'SearchFilterFormatService', 'LanguageService', 'SessionService',
  'GridGroupingService', 'bhConstants', 'GridStateService', '$state', 'GridColumnService'
];

/**
 * Stock Inventory Controller
 * This module is a registry page for stock inventories
 */
function StockInventoriesController(
  Stock, Notify, uiGridConstants, $translate, Modal,
  SearchFilterFormat, Languages, Session, Grouping, bhConstants, GridState, $state, Columns
) {
  var vm = this;
  var filterKey = 'inventory';
  var StockInventoryFilters = Stock.filter.inventory;
  var cacheKey = 'stock-inventory-grid';
  var state;
  var gridColumns;

  var columns = [
    { field            : 'depot_text',
      displayName      : 'STOCK.DEPOT',
      headerCellFilter : 'translate' },

    { field            : 'code',
      displayName      : 'STOCK.CODE',
      headerCellFilter : 'translate' },

    { field            : 'text',
      displayName      : 'STOCK.INVENTORY',
      headerCellFilter : 'translate',
      width            : '20%' },

    { field            : 'quantity',
      displayName      : 'STOCK.QUANTITY',
      headerCellFilter : 'translate',
      aggregationType  : uiGridConstants.aggregationTypes.sum,
      cellClass        : 'text-right',
      footerCellClass  : 'text-right',
    },

    { field            : 'unit_type',
      width            : 75,
      displayName      : 'TABLE.COLUMNS.UNIT',
      headerCellFilter : 'translate',
      cellTemplate     : 'modules/stock/inventories/templates/unit.tmpl.html' },

    { field            : 'status',
      displayName      : 'STOCK.STATUS.LABEL',
      headerCellFilter : 'translate',
      enableFiltering  : false,
      enableSorting    : false,
      cellTemplate     : 'modules/stock/inventories/templates/status.cell.html' },

    { field           : 'avg_consumption',
      displayName     : 'CMM',
      enableFiltering : false,
      enableSorting   : false,
      cellClass       : 'text-right',
      cellTemplate    : '' },

    { field            : 'S_MONTH',
      displayName      : 'MS',
      enableFiltering  : false,
      enableSorting    : false,
      cellClass        : 'text-right',
      cellTemplate     : '' },

    { field           : 'S_SEC',
      displayName     : 'SS',
      enableFiltering : false,
      enableSorting   : false,
      cellClass       : 'text-right',
      cellTemplate    : '' },

    { field           : 'S_MIN',
      displayName     : 'MIN',
      enableFiltering : false,
      enableSorting   : false,
      cellClass       : 'text-right',
      cellTemplate    : '' },

    { field           : 'S_MAX',
      displayName     : 'MAX',
      enableFiltering : false,
      enableSorting   : false,
      cellClass       : 'text-right',
      cellTemplate    : '' },

    { field            : 'S_Q',
      displayName      : 'STOCK.ORDERS',
      headerCellFilter : 'translate',
      enableFiltering  : false,
      enableSorting    : false,
      cellClass        : 'text-right',
      cellTemplate     : 'modules/stock/inventories/templates/appro.cell.html' },
  ];

  vm.enterprise = Session.enterprise;
  vm.gridApi = {};  

  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    columnDefs        : columns,
    enableSorting     : true,
    fastWatch         : true,
    flatEntityAccess  : true,
    onRegisterApi : onRegisterApi,
  };

  vm.grouping = new Grouping(vm.gridOptions, true, 'depot_text', vm.grouped, true);
  state = new GridState(vm.gridOptions, cacheKey);

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // expose view logic
  // vm.search = search;
  // vm.onRemoveFilter = onRemoveFilter;
  // vm.clearFilters = clearFilters;
  // vm.setStatusFlag = setStatusFlag;

  function setStatusFlag(item) {
    item.isSoldOut = item.status === bhConstants.stockStatus.IS_SOLD_OUT;
    item.isInStock = item.status === bhConstants.stockStatus.IS_IN_STOCK;
    item.hasSecurityWarning = item.status === bhConstants.stockStatus.HAS_SECURITY_WARNING;
    item.hasMinimumWarning = item.status === bhConstants.stockStatus.HAS_MINIMUM_WARNING;
    item.hasOverageWarning = item.status === bhConstants.stockStatus.HAS_OVERAGE_WARNING;
  }

  // on remove one filter
  function onRemoveFilter(key) {
    SearchFilterFormat.onRemoveFilter(key, vm.filters, reload);
  }

  // clear all filters
  function clearFilters() {
    SearchFilterFormat.clearFilters(reload);
  }

  // load stock lots in the grid
  function load(filters) {
    vm.hasError = false;
    vm.loading = true;

    Stock.inventories.read(null, filters)
      .then(function (rows) {
        // set status flags
        rows.forEach(function (item) {
          setStatusFlag(item);
        });

        vm.gridOptions.data = rows;

        vm.grouping.unfoldAllGroups();
      })
      .catch(Notify.handleError)
      .finally(function () {
        vm.loading = false;
      });
  }

  // search modal
  function search() {
    Modal.openSearchInventories()
    .then(function (filters) {
      if (!filters) { return; }
      reload(filters);
    })
    .catch(Notify.handleError);
  }

  // reload
  function reload(filters) {
    vm.filters = filters;
    vm.formatedFilters = SearchFilterFormat.formatDisplayNames(filters.display);
    load(filters.identifiers);
  }

  function startup (){
    if ($state.params.filters) {
      var changes = [{ key : $state.params.filters.key, value : $state.params.filters.value }]
      stockMovementFilters.replaceFilters(changes);
      Stock.cacheFilters(filterKey);
    }

    load(StockInventoryFilters.formatHTTP(true));
    vm.latestViewFilters = StockInventoryFilters.formatView();
  }

  startup();
}
