angular.module('bhima.controllers')
  .controller('StockInventoriesController', StockInventoriesController);

StockInventoriesController.$inject = [
  'StockService', 'NotifyService',
  'uiGridConstants', 'StockModalService', 'LanguageService', 'SessionService',
  'GridGroupingService', 'bhConstants', 'GridStateService',
  '$state', 'GridColumnService', '$httpParamSerializer', 'BarcodeService',
];

/**
 * Stock Inventory Controller
 * This module is a registry page for stock inventories
 */
function StockInventoriesController(
  Stock, Notify, uiGridConstants, Modal, Languages,
  Session, Grouping, bhConstants, GridState, $state, Columns,
  $httpParamSerializer, Barcode,
) {
  const vm = this;
  const cacheKey = 'stock-inventory-grid';
  const stockInventoryFilters = Stock.filter.inventory;

  vm.openBarcodeScanner = openBarcodeScanner;

  const columns = [{
    field            : 'depot_text',
    displayName      : 'STOCK.DEPOT',
    headerCellFilter : 'translate',
  }, {
    field            : 'code',
    displayName      : 'STOCK.CODE',
    headerCellFilter : 'translate',
  }, {
    field            : 'text',
    displayName      : 'STOCK.INVENTORY',
    headerCellFilter : 'translate',
    width            : '20%',
    cellTemplate     : 'modules/stock/inventories/templates/inventory.cell.html',
  }, {
    field            : 'group_name',
    displayName      : 'STOCK.INVENTORY_GROUP',
    headerCellFilter : 'translate',
  }, {
    field            : 'quantity',
    displayName      : 'STOCK.QUANTITY',
    headerCellFilter : 'translate',
    cellClass        : 'text-right',
  }, {
    field            : 'unit_type',
    width            : 75,
    displayName      : 'TABLE.COLUMNS.UNIT',
    headerCellFilter : 'translate',
    cellTemplate     : 'modules/stock/inventories/templates/unit.tmpl.html',
  }, {
    field            : 'status',
    displayName      : 'STOCK.STATUS.LABEL',
    headerCellFilter : 'translate',
    enableFiltering  : false,
    enableSorting    : false,
    cellTemplate     : 'modules/stock/inventories/templates/status.cell.html',
  }, {
    field           : 'avg_consumption',
    displayName     : 'CMM',
    enableFiltering : false,
    enableSorting   : false,
    cellClass       : 'text-right',
    cellTemplate    : '',
  }, {
    field            : 'S_MONTH',
    displayName      : 'MS',
    enableFiltering  : false,
    enableSorting    : false,
    cellClass        : 'text-right',
    cellTemplate     : '',
  }, {
    field           : 'S_SEC',
    displayName     : 'SS',
    enableFiltering : false,
    enableSorting   : false,
    cellClass       : 'text-right',
    cellTemplate    : '',
  }, {
    field           : 'S_MIN',
    displayName     : 'MIN',
    enableFiltering : false,
    enableSorting   : false,
    cellClass       : 'text-right',
    cellTemplate    : '',
  }, {
    field           : 'S_MAX',
    displayName     : 'MAX',
    enableFiltering : false,
    enableSorting   : false,
    cellClass       : 'text-right',
    cellTemplate    : '',
  }, {
    field            : 'S_Q',
    displayName      : 'STOCK.ORDERS',
    headerCellFilter : 'translate',
    enableFiltering  : false,
    enableSorting    : false,
    cellClass        : 'text-right',
    cellTemplate     : 'modules/stock/inventories/templates/appro.cell.html',
  }];

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
  vm.getQueryString = Stock.getQueryString;

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

  function setDefaultFilters() {
    const assignedKeys = Object.keys(stockInventoryFilters.formatHTTP());

    // assign default includeEmptyLot filter
    if (assignedKeys.indexOf('includeEmptyLot') === -1) {
      stockInventoryFilters.assignFilter('includeEmptyLot', 0);
      stockInventoryFilters.formatCache();
      vm.latestViewFilters = stockInventoryFilters.formatView();
    }
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
    stockInventoryFilters.remove(key);
    stockInventoryFilters.formatCache();
    vm.latestViewFilters = stockInventoryFilters.formatView();
    return load(stockInventoryFilters.formatHTTP(true));
  }

  function orderByDepot(rowA, rowB) {
    return rowA.depot_text > rowB.depot_text ? 1 : -1;
  }

  // load stock lots in the grid
  function load(filters) {
    vm.hasError = false;
    vm.loading = true;

    Stock.inventories.read(null, filters)
      .then((rows) => {

        // FIXME(@jniles): we should do this ordering on the server via an ORDER BY
        rows.sort(orderByDepot);

        // set status flags
        rows.forEach(setStatusFlag);

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
        if (!changes) { return; }
        stockInventoryFilters.replaceFilters(changes);
        stockInventoryFilters.formatCache();
        vm.latestViewFilters = stockInventoryFilters.formatView();
        load(stockInventoryFilters.formatHTTP(true));
      });
  }

  function startup() {
    setDefaultFilters();

    if ($state.params.filters.length) {
      stockInventoryFilters.replaceFiltersFromState($state.params.filters);
      stockInventoryFilters.formatCache();
    }

    load(stockInventoryFilters.formatHTTP(true));
    vm.latestViewFilters = stockInventoryFilters.formatView();
  }

  vm.exportTo = (renderer) => {
    const filterOpts = stockInventoryFilters.formatHTTP();
    const defaultOpts = {
      renderer,
      lang : Languages.key,
    };
    const options = angular.merge(defaultOpts, filterOpts);
    // return  serialized options
    return $httpParamSerializer(options);
  };

  vm.downloadExcel = () => {
    const filterOpts = stockInventoryFilters.formatHTTP();
    const defaultOpts = {
      renderer : 'xlsxReport',
      lang : Languages.key,
      renameKeys : true,
      displayNames : gridColumns.getDisplayNames(),
    };
    // combine options
    const options = angular.merge(defaultOpts, filterOpts);
    // return  serialized options
    return $httpParamSerializer(options);
  };

  vm.toggleInlineFilter = () => {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };

  /**
   * @function openBarcodeScanner
   *
   * @description
   * Opens the barcode scanner component and receives the record from the
   * modal.
   */
  function openBarcodeScanner() {
    Barcode.modal({ shouldSearch : false })
      .then(record => {
        stockInventoryFilters.replaceFilters([
          { key : 'inventory_uuid', value : record.uuid, displayValue : record.reference },
        ]);

        load(stockInventoryFilters.formatHTTP(true));
        vm.latestViewFilters = stockInventoryFilters.formatView();
      });
  }

  startup();
}
