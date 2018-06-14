angular.module('bhima.controllers')
  .controller('StockInventoriesController', StockInventoriesController);

StockInventoriesController.$inject = [
  'StockService', 'NotifyService',
  'uiGridConstants', '$translate', 'StockModalService', 'LanguageService', 'SessionService',
  'GridGroupingService', 'bhConstants', 'GridStateService', '$state', 'GridColumnService', '$httpParamSerializer',
];

/**
 * Stock Inventory Controller
 * This module is a registry page for stock inventories
 */
function StockInventoriesController(
  Stock, Notify, uiGridConstants, $translate, Modal, Languages,
  Session, Grouping, bhConstants, GridState, $state, Columns, $httpParamSerializer
) {
  const vm = this;
  const filterKey = 'inventory';
  const stockInventoryFilters = Stock.filter.inventory;
  const cacheKey = 'stock-inventory-grid';

  const columns = [
    {
      field            : 'depot_text',
      displayName      : 'STOCK.DEPOT',
      headerCellFilter : 'translate',
    },

    {
      field            : 'code',
      displayName      : 'STOCK.CODE',
      headerCellFilter : 'translate',
    },

    {
      field            : 'text',
      displayName      : 'STOCK.INVENTORY',
      headerCellFilter : 'translate',
      width            : '20%',
    },

    {
      field            : 'group_name',
      displayName      : 'STOCK.INVENTORY_GROUP',
      headerCellFilter : 'translate',
    },

    {
      field            : 'quantity',
      displayName      : 'STOCK.QUANTITY',
      headerCellFilter : 'translate',
      cellClass        : 'text-right',
    },

    {
      field            : 'unit_type',
      width            : 75,
      displayName      : 'TABLE.COLUMNS.UNIT',
      headerCellFilter : 'translate',
      cellTemplate     : 'modules/stock/inventories/templates/unit.tmpl.html',
    },

    {
      field            : 'status',
      displayName      : 'STOCK.STATUS.LABEL',
      headerCellFilter : 'translate',
      enableFiltering  : false,
      enableSorting    : false,
      cellTemplate     : 'modules/stock/inventories/templates/status.cell.html',
    },

    {
      field           : 'avg_consumption',
      displayName     : 'CMM',
      enableFiltering : false,
      enableSorting   : false,
      cellClass       : 'text-right',
      cellTemplate    : '',
    },

    {
      field            : 'S_MONTH',
      displayName      : 'MS',
      enableFiltering  : false,
      enableSorting    : false,
      cellClass        : 'text-right',
      cellTemplate     : '',
    },

    {
      field           : 'S_SEC',
      displayName     : 'SS',
      enableFiltering : false,
      enableSorting   : false,
      cellClass       : 'text-right',
      cellTemplate    : '',
    },

    {
      field           : 'S_MIN',
      displayName     : 'MIN',
      enableFiltering : false,
      enableSorting   : false,
      cellClass       : 'text-right',
      cellTemplate    : '',
    },

    {
      field           : 'S_MAX',
      displayName     : 'MAX',
      enableFiltering : false,
      enableSorting   : false,
      cellClass       : 'text-right',
      cellTemplate    : '',
    },

    {
      field            : 'S_Q',
      displayName      : 'STOCK.ORDERS',
      headerCellFilter : 'translate',
      enableFiltering  : false,
      enableSorting    : false,
      cellClass        : 'text-right',
      cellTemplate     : 'modules/stock/inventories/templates/appro.cell.html',
    },
  ];

  // grouping box
  vm.groupingBox = [
    { label : 'STOCK.INVENTORY_GROUP', value : 'group_name' },
  ];

  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    columnDefs        : columns,
    enableSorting     : true,
    fastWatch         : true,
    flatEntityAccess  : true,
    onRegisterApi,
  };

  const gridColumns = new Columns(vm.gridOptions, cacheKey);
  const state = new GridState(vm.gridOptions, cacheKey);

  vm.grouping = new Grouping(vm.gridOptions, true, 'depot_text', vm.grouped, true);
  vm.enterprise = Session.enterprise;
  vm.gridApi = {};
  vm.saveGridState = state.saveGridState;

  function clearGridState() {
    state.clearGridState();
    $state.reload();
  }

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // expose view logic
  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.openColumnConfigModal = openColumnConfigModal;
  vm.clearGridState = clearGridState;

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

  // This function opens a modal through column service to let the user toggle
  // the visibility of the inventories registry's columns.
  function openColumnConfigModal() {
    // column configuration has direct access to the grid API to alter the current
    // state of the columns - this will be saved if the user saves the grid configuration
    gridColumns.openConfigurationModal();
  }

  function setStatusFlag(item) {
    item.isSoldOut = item.status === bhConstants.stockStatus.IS_SOLD_OUT;
    item.isInStock = item.status === bhConstants.stockStatus.IS_IN_STOCK;
    item.hasSecurityWarning = item.status === bhConstants.stockStatus.HAS_SECURITY_WARNING;
    item.hasMinimumWarning = item.status === bhConstants.stockStatus.HAS_MINIMUM_WARNING;
    item.hasOverageWarning = item.status === bhConstants.stockStatus.HAS_OVERAGE_WARNING;
  }

  // on remove one filter
  function onRemoveFilter(key) {
    Stock.removeFilter(filterKey, key);

    Stock.cacheFilters(filterKey);
    vm.latestViewFilters = stockInventoryFilters.formatView();

    return load(stockInventoryFilters.formatHTTP(true));
  }

  // load stock lots in the grid
  function load(filters) {
    vm.hasError = false;
    vm.loading = true;

    // no negative or empty lot
    filters.includeEmptyLot = 0;

    Stock.inventories.read(null, filters)
      .then((rows) => {
        // set status flags
        rows.forEach((item) => {
          setStatusFlag(item);
        });

        vm.gridOptions.data = rows;

        vm.grouping.unfoldAllGroups();
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  // open a modal to let user filtering data
  function search() {
    const filtersSnapshot = stockInventoryFilters.formatHTTP();

    Modal.openSearchInventories(filtersSnapshot)
      .then((changes) => {
        stockInventoryFilters.replaceFilters(changes);
        Stock.cacheFilters(filterKey);
        vm.latestViewFilters = stockInventoryFilters.formatView();

        load(stockInventoryFilters.formatHTTP(true));
      });
  }

  function startup() {
    if ($state.params.filters.length) {
      stockInventoryFilters.replaceFiltersFromState($state.params.filters);
      Stock.cacheFilters(filterKey);
    }

    load(stockInventoryFilters.formatHTTP(true));
    vm.latestViewFilters = stockInventoryFilters.formatView();
  }

  vm.downloadExcel = () => {
    const filterOpts = stockInventoryFilters.formatHTTP();
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
