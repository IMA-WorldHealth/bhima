angular.module('bhima.controllers')
  .controller('StockLotsController', StockLotsController);

StockLotsController.$inject = [
  'StockService', 'NotifyService',
  'uiGridConstants', '$translate', 'StockModalService',
  'SearchFilterFormatService', 'LanguageService',
  'GridGroupingService', 'GridStateService', 'GridColumnService',
  'bhConstants',
];

/**
 * Stock lots Controller
 * This module is a registry page for stock lots
 */
function StockLotsController(Stock, Notify,
  uiGridConstants, $translate, Modal,
  SearchFilterFormat, Languages, Grouping,
  GridState, Columns, bhConstants) {
  var vm = this;

  var cacheKey = 'lot-grid';
  var gridColumns;
  var state;
  var FILTER_BAR_HEIGHT = bhConstants.grid.FILTER_BAR_HEIGHT;

  // grouping box
  vm.groupingBox = [
    { label: 'STOCK.INVENTORY', value: 'text' },
  ];

  // global variables
  vm.filters = { lang: Languages.key };
  vm.formatedFilters = [];

  // grid columns
  var columns = [
    {
      field: 'depot_text',
      displayName: 'STOCK.DEPOT',
      headerCellFilter: 'translate'
    },

    {
      field: 'code',
      displayName: 'STOCK.CODE',
      headerCellFilter: 'translate',
      aggregationType: uiGridConstants.aggregationTypes.count
    },

    {
      field: 'text',
      displayName: 'STOCK.INVENTORY',
      headerCellFilter: 'translate'
    },

    {
      field: 'label',
      displayName: 'STOCK.LOT',
      headerCellFilter: 'translate'
    },

    {
      field: 'quantity',
      displayName: 'STOCK.QUANTITY',
      headerCellFilter: 'translate',
      aggregationType: uiGridConstants.aggregationTypes.sum
    },

    {
      field: 'unit_type',
      width: 75,
      displayName: 'TABLE.COLUMNS.UNIT',
      headerCellFilter: 'translate',
      cellTemplate: 'modules/stock/inventories/templates/unit.tmpl.html'
    },

    { field: 'entry_date', displayName: 'STOCK.ENTRY_DATE', headerCellFilter: 'translate', cellFilter: 'date' },
    { field: 'expiration_date', displayName: 'STOCK.EXPIRATION_DATE', headerCellFilter: 'translate', cellFilter: 'date' },
    { field: 'delay_expiration', displayName: 'STOCK.EXPIRATION', headerCellFilter: 'translate' },
  ];

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider: vm,
    enableColumnMenus: false,
    columnDefs: columns,
    enableSorting: true,
    showColumnFooter: true,
    fastWatch: true,
    flatEntityAccess: true,
  };

  vm.grouping = new Grouping(vm.gridOptions, true, 'depot_text', vm.grouped, true);

  // expose to the view
  vm.search = search;
  vm.openColumnConfigModal = openColumnConfigModal;
  vm.onRemoveFilter = onRemoveFilter;
  vm.clearFilters = clearFilters;
  vm.selectGroup = selectGroup;
  vm.toggleGroup = toggleGroup;
  vm.loading = false;

  gridColumns = new Columns(vm.gridOptions, cacheKey);
  state = new GridState(vm.gridOptions, cacheKey);

  // on remove one filter
  function onRemoveFilter(key) {
    SearchFilterFormat.onRemoveFilter(key, vm.filters, reload);
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

  // clear all filters
  function clearFilters() {
    SearchFilterFormat.clearFilters(reload);
  }  

  // initialize module
  function startup() {
    load(Stock.lotFilters.formatHTTP(true));
    vm.latestViewFilters = Stock.lotFilters.formatView();
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
   * lots movements and allow a better UX for slow loads.
   */
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // load stock lots in the grid
  function load(filters) {
    vm.hasError = false;
    toggleLoadingIndicator();

    Stock.lots.read(null, filters)
    .then(function(lots){
      vm.gridOptions.data = lots;
      vm.grouping.unfoldAllGroups();
    })
    .catch(errorHandler)
    .finally(function (){
      toggleLoadingIndicator();     
    });
  }

  // remove a filter with from the filter object, save the filters and reload
  vm.onRemoveFilter = function onRemoveFilter(key) {
    Stock.removeLotFilter(key);

    Stock.cacheLotFilters();
    vm.latestViewFilters = Stock.lotFilters.formatView();

    return load(Stock.lotFilters.formatHTTP(true));
  }

  function search() {
    var filtersSnapshot = Stock.lotFilters.formatHTTP();

    Modal.openSearchLots(filtersSnapshot)
      .then(function (changes) {
            console.log(vm.changes);

        Stock.lotFilters.replaceFilters(changes);
        Stock.cacheLotFilters();
        vm.latestViewFilters = Stock.lotFilters.formatView();

        return load(Stock.lotFilters.formatHTTP(true));
      })
      .catch(angular.noop);
  }

  // This function opens a modal through column service to let the user toggle
  // the visibility of the lots registry's columns.
  function openColumnConfigModal() {
    // column configuration has direct access to the grid API to alter the current
    // state of the columns - this will be saved if the user saves the grid configuration
    gridColumns.openConfigurationModal();
  };

  startup();
}
