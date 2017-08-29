angular.module('bhima.controllers')
.controller('StockOriginsController', StockOriginsController);

StockOriginsController.$inject = [
  'StockService', 'NotifyService','uiGridConstants', 
  '$translate', 'StockModalService', 'SearchFilterFormatService', 
  'LanguageService', 'GridGroupingService', 'ReceiptModal', 
  'AppCache', '$state', 'GridColumnService', 'GridStateService',
];

/**
 * Stock Origin Controller
 * This module is a registry page for stock origins
 */
function StockOriginsController(Stock, Notify, uiGridConstants, 
  $translate, Modal, SearchFilterFormat, Languages, 
  Grouping, Receipts, AppCache, $state, Columns, GridState) {
  var vm = this;

  var cacheKey = 'StockOrigins';
  var cache = AppCache(cacheKey);
  var state;

  var filterKey = 'origin';
  var stockOriginFilters = Stock.filter.origin;

  vm.download = Stock.download;

  // map receipts
  var mapOriginDocument = {
    'STOCK.PURCHASE_ORDER' : Receipts.purchase,
  };

  // map entry
  var mapEntryDocument = {
    1 : Receipts.stockEntryPurchaseReceipt,
    13 : Receipts.stockEntryIntegrationReceipt,
  };

  // grouping box
  vm.groupingBox = [
    { label: 'STOCK.INVENTORY', value: 'text' },
  ];

  // global variables
  vm.filters = { lang: Languages.key };
  vm.latestViewFilters = [];

  // grid columns
  var columns = [
    { field            : 'reference',
      displayName      : 'STOCK.ORIGIN_DOCUMENT',
      headerCellFilter : 'translate' },

    { field            : 'display_name',
      displayName      : 'STOCK.ORIGIN',
      cellFilter       : 'translate',
      headerCellFilter : 'translate' },

    { field            : 'code',
      displayName      : 'STOCK.CODE',
      headerCellFilter : 'translate',
      aggregationType  : uiGridConstants.aggregationTypes.count },

    { field            : 'text',
      displayName      : 'STOCK.INVENTORY',
      headerCellFilter : 'translate' },

    { field            : 'label',
      displayName      : 'STOCK.LOT',
      headerCellFilter : 'translate' },

    { field            : 'entry_date',
      displayName      : 'STOCK.ENTRY_DATE',
      headerCellFilter : 'translate',
      cellFilter       : 'date' },

    { field            : 'expiration_date',
      displayName      : 'STOCK.EXPIRATION_DATE',
      headerCellFilter : 'translate',
      cellFilter       : 'date' },

    {
      field           : 'action',
      displayName     : '',
      cellTemplate    : '/modules/stock/origins/templates/action.tmpl.html',
      enableFiltering : false,
      enableSorting   : false },
  ];

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    columnDefs        : columns,
    enableSorting     : true,
    showColumnFooter  : true,
    fastWatch         : true,
    flatEntityAccess  : true,
  };

  var columnConfig = new Columns(vm.gridOptions, cacheKey);
  state = new GridState(vm.gridOptions, cacheKey);

  vm.grouping = new Grouping(vm.gridOptions, true, 'reference', vm.grouped, true);

  vm.saveGridState = state.saveGridState;
  vm.clearGridState = function clearGridState() {
    state.clearGridState();
    $state.reload();
  }

  // expose to the view
  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.clearFilters = clearFilters;
  vm.selectGroup = selectGroup;
  vm.toggleGroup = toggleGroup;
  vm.getOriginDocument = getOriginDocument;
  vm.getEntryDocument = getEntryDocument;
  vm.openColumnConfiguration = openColumnConfiguration;

  // on remove one filter
  function onRemoveFilter(key) {
    Stock.removeFilter(filterKey, key);

    Stock.cacheFilters(filterKey);
    vm.latestViewFilters = stockOriginFilters.formatView();

    return load(stockOriginFilters.formatHTTP(true));
  }

  // select group
  function selectGroup(group) {
    if (!group) { return; }

    vm.selectedGroup = group;
  }

  // toggle group
  function toggleGroup(column) {
    if (vm.grouped) {
      vm.grouping.removeGrouping(column);
      vm.grouped = false;
    } else {
      vm.grouping.changeGrouping(column);
      vm.grouped = true;
    }
  }

  function openColumnConfiguration() {
    columnConfig.openConfigurationModal();
  }

  function getOriginDocument(uuid, origin) {
    if (!mapOriginDocument[origin]) { return; }

    mapOriginDocument[origin](uuid);
  }

  function getEntryDocument(uuid, fluxId) {
    if (!mapEntryDocument[fluxId]) { return; }

    mapEntryDocument[fluxId](uuid);
  }

  // clear all filters
  function clearFilters() {
    SearchFilterFormat.clearFilters(reload);
  }

  // initialize module
  function startup() {
    load(stockOriginFilters.formatHTTP(true));
    vm.latestViewFilters = stockOriginFilters.formatView();
  }

  // load stock origins in the grid
  function load(filters) {
    Stock.stocks.read('/origins', filters).then(function (origins) {
      vm.gridOptions.data = origins;

      vm.grouping.unfoldAllGroups();
    })
    .catch(Notify.handleError);
  }

  // search modal
  function search() {
    var filtersSnapshot = stockOriginFilters.formatHTTP();

    Modal.openSearchOrigins(filtersSnapshot)
      .then(function (changes) {
        stockOriginFilters.replaceFilters(changes);
        Stock.cacheFilters(filterKey);
        vm.latestViewFilters = stockOriginFilters.formatView();

        return load(stockOriginFilters.formatHTTP(true));
      })
      .catch(angular.noop);
  }

  // reload
  function reload(filters) {
    vm.filters = filters;
    vm.latestViewFilters = stockOriginFilters.formatView();
    load(filters.identifiers);
  }

  startup();
}
