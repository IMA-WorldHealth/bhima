angular.module('bhima.controllers')
  .controller('StockLotsController', StockLotsController);

StockLotsController.$inject = [
  'StockService', 'NotifyService',
  'uiGridConstants', '$translate', 'StockModalService', 'LanguageService',
  'GridGroupingService', 'GridStateService', 'GridColumnService',
  'bhConstants', '$state', '$httpParamSerializer',
];

/**
 * Stock lots Controller
 * This module is a registry page for stock lots
 */
function StockLotsController(
  Stock, Notify,
  uiGridConstants, $translate, Modal, Languages, Grouping,
  GridState, Columns, bhConstants, $state, $httpParamSerializer
) {
  const vm = this;
  const cacheKey = 'lot-grid';
  const filterKey = 'lot';
  const stockLotFilters = Stock.filter.lot;

  // grouping box
  vm.groupingBox = [
    { label : 'STOCK.INVENTORY', value : 'text' },
    { label : 'STOCK.INVENTORY_GROUP', value : 'group_name' },
  ];

  // grid columns
  const columns = [
    {
      field : 'depot_text',
      displayName : 'STOCK.DEPOT',
      headerCellFilter : 'translate',
    },

    {
      field : 'code',
      displayName : 'STOCK.CODE',
      headerCellFilter : 'translate',
    },

    {
      field : 'text',
      displayName : 'STOCK.INVENTORY',
      headerCellFilter : 'translate',
    },

    {
      field : 'group_name',
      displayName : 'TABLE.COLUMNS.INVENTORY_GROUP',
      headerCellFilter : 'translate',
    },

    {
      field : 'label',
      displayName : 'STOCK.LOT',
      headerCellFilter : 'translate',
    },

    {
      field : 'quantity',
      displayName : 'STOCK.QUANTITY',
      headerCellFilter : 'translate',
    },

    {
      field : 'unit_type',
      width : 75,
      displayName : 'TABLE.COLUMNS.UNIT',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/inventories/templates/unit.tmpl.html',
    },

    {
      field : 'entry_date',
      displayName : 'STOCK.ENTRY_DATE',
      headerCellFilter : 'translate',
      cellFilter : 'date',
    },

    {
      field : 'expiration_date',
      displayName : 'STOCK.EXPIRATION_DATE',
      headerCellFilter : 'translate',
      cellFilter : 'date',
    },
    {
      field : 'delay_expiration',
      displayName : 'STOCK.EXPIRATION',
      headerCellFilter : 'translate',
    },
  ];

  const gridFooterTemplate = `
    <div>
      <b>{{ grid.appScope.countGridRows() }}</b> 
      <span translate>TABLE.AGGREGATES.ROWS</span>
    </div>
  `;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : columns,
    enableSorting : true,
    showColumnFooter : true,
    fastWatch : true,
    flatEntityAccess : true,
    showGridFooter : true,
    gridFooterTemplate,
  };

  const gridColumns = new Columns(vm.gridOptions, cacheKey);
  const state = new GridState(vm.gridOptions, cacheKey);

  // expose to the view model
  vm.grouping = new Grouping(vm.gridOptions, true, 'depot_text', vm.grouped, true);
  vm.download = Stock.download;
  vm.clearGridState = clearGridState;
  vm.search = search;
  vm.openColumnConfigModal = openColumnConfigModal;
  vm.loading = false;
  vm.saveGridState = state.saveGridState;

  // count data rows
  vm.countGridRows = () => {
    return vm.gridOptions.data.length;
  };

  // select group
  vm.selectGroup = (group) => {
    if (!group) { return; }
    vm.selectedGroup = group;
  };

  // toggle group
  vm.toggleGroup = (column) => {
    if (vm.grouped) {
      vm.grouping.removeGrouping(column);
      vm.grouped = false;
    } else {
      vm.grouping.changeGrouping(column);
      vm.grouped = true;
    }
  };

  // initialize module
  function startup() {
    if ($state.params.filters.length) {
      stockLotFilters.replaceFiltersFromState($state.params.filters);
      Stock.cacheFilters(filterKey);
    }

    load(stockLotFilters.formatHTTP(true));
    vm.latestViewFilters = stockLotFilters.formatView();
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

    // no negative or empty lot
    filters.includeEmptyLot = 0;

    Stock.lots.read(null, filters)
      .then((lots) => {
        vm.gridOptions.data = lots;
        vm.grouping.unfoldAllGroups();
      })
      .catch(errorHandler)
      .finally(toggleLoadingIndicator);
  }

  // remove a filter with from the filter object, save the filters and reload
  vm.onRemoveFilter = function onRemoveFilter(key) {
    Stock.removeFilter(filterKey, key);

    Stock.cacheFilters(filterKey);
    vm.latestViewFilters = stockLotFilters.formatView();

    return load(stockLotFilters.formatHTTP(true));
  };

  function search() {
    const filtersSnapshot = stockLotFilters.formatHTTP();

    Modal.openSearchLots(filtersSnapshot)
      .then((changes) => {
        stockLotFilters.replaceFilters(changes);
        Stock.cacheFilters(filterKey);
        vm.latestViewFilters = stockLotFilters.formatView();

        return load(stockLotFilters.formatHTTP(true));
      });
  }

  // This function opens a modal through column service to let the user toggle
  // the visibility of the lots registry's columns.
  function openColumnConfigModal() {
    // column configuration has direct access to the grid API to alter the current
    // state of the columns - this will be saved if the user saves the grid configuration
    gridColumns.openConfigurationModal();
  }

  // saves the grid's current configuration
  function clearGridState() {
    state.clearGridState();
    $state.reload();
  }

  vm.downloadExcel = () => {

    const filterOpts = stockLotFilters.formatHTTP();
    const defaultOpts = {
      renderer : 'xlsx',
      lang : Languages.key,
      renameKeys : true,
      displayNames : gridColumns.getDisplayNames(),
    };
    // combine options
    const options = angular.merge(defaultOpts, filterOpts);
    // return  serialized options
    return $httpParamSerializer(options);
  };

  startup();
}
