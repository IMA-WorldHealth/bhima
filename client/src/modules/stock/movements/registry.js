angular.module('bhima.controllers')
  .controller('StockMovementsController', StockMovementsController);

StockMovementsController.$inject = [
  'StockService', 'NotifyService', 'uiGridConstants',
  'StockModalService', 'LanguageService', 'SessionService', 'FluxService',
  'ReceiptModal', 'GridGroupingService', '$state', 'GridColumnService', 'GridStateService', '$httpParamSerializer',
  '$translate',
];

/**
 * Stock movements Controller
 * This module is a registry page for stock movements
 */
function StockMovementsController(
  Stock, Notify, uiGridConstants, Modal,
  Languages, Session, Flux, ReceiptModal, Grouping, $state, Columns, GridState, $httpParamSerializer,
  $translate,
) {
  const vm = this;
  const cacheKey = 'movements-grid';
  const stockMovementFilters = Stock.filter.movement;

  // grid columns
  const columns = getGridColumns();

  // bind flux id with receipt
  const mapFlux = {
    1 : { receipt : ReceiptModal.stockEntryPurchaseReceipt },
    2 : { receipt : ReceiptModal.stockEntryDepotReceipt },
    3 : { receipt : ReceiptModal.stockAdjustmentReceipt },
    6 : { receipt : ReceiptModal.stockEntryDonationReceipt },
    8 : { receipt : ReceiptModal.stockExitDepotReceipt },
    9 : { receipt : ReceiptModal.stockExitPatientReceipt },
    10 : { receipt : ReceiptModal.stockExitServiceReceipt },
    11 : { receipt : ReceiptModal.stockExitLossReceipt },
    12 : { receipt : ReceiptModal.stockAdjustmentReceipt },
    13 : { receipt : ReceiptModal.stockEntryIntegrationReceipt },
    14 : { receipt : ReceiptModal.stockAdjustmentReceipt },
    15 : { receipt : ReceiptModal.stockAdjustmentReceipt },
  };

  // grouping box
  vm.groupingBox = [
    { label : 'STOCK.INVENTORY', value : 'text' },
    { label : 'STOCK.IO', value : 'io' },
    { label : 'STOCK.LOT', value : 'label' },
  ];

  vm.gridApi = {};

  // global variables
  vm.enterprise = Session.enterprise;

  function getGridColumns() {
    return [{
      field : 'depot_text',
      displayName : 'STOCK.DEPOT',
      headerCellFilter : 'translate',
      aggregationType : uiGridConstants.aggregationTypes.count,
      aggregationHideLabel : true,
    }, {
      field : 'io',
      displayName : 'STOCK.IO',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/movements/templates/io.cell.html',
    }, {
      field : 'documentReference',
      displayName : 'TABLE.COLUMNS.REFERENCE',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/movements/templates/reference.cell.html',
    }, {
      field : 'text',
      displayName : 'STOCK.INVENTORY',
      headerCellFilter : 'translate',
    }, {
      field : 'label',
      displayName : 'STOCK.LOT',
      headerCellFilter : 'translate',
    }, {
      field : 'quantity',
      type : 'number',
      displayName : 'STOCK.QUANTITY',
      headerCellFilter : 'translate',
      aggregationType : uiGridConstants.aggregationTypes.sum,
      aggregationHideLabel : true,
      cellClass : 'text-right',
      footerCellClass : 'text-right',
    }, {
      field : 'unit_type',
      width : 75,
      displayName : 'TABLE.COLUMNS.UNIT',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/inventories/templates/unit.tmpl.html',
    }, {
      field : 'unit_cost',
      type : 'number',
      displayName : 'STOCK.UNIT_COST',
      headerCellFilter : 'translate',
      cellFilter : 'currency:grid.appScope.enterprise.currency_id',
      cellClass : 'text-right',
    }, {
      field : 'cost',
      type : 'number',
      displayName : 'STOCK.COST',
      headerCellFilter : 'translate',
      aggregationType : totalCost,
      aggregationHideLabel : true,
      cellFilter : 'currency:grid.appScope.enterprise.currency_id',
      cellClass : 'text-right',
      footerCellFilter : 'currency:grid.appScope.enterprise.currency_id',
      footerCellClass : 'text-right',
    }, {
      field : 'date',
      type : 'date',
      displayName : 'FORM.LABELS.DATE',
      headerCellFilter : 'translate',
      cellFilter : 'date',
      cellClass : 'text-right',
    }, {
      field : 'flux_id',
      displayName : 'STOCK.FLUX',
      aggregationHideLabel : true,
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/movements/templates/flux.cell.html',
    }, {
      field : 'action',
      displayName : '',
      enableFiltering : false,
      enableSorting : false,
      cellTemplate : 'modules/stock/movements/templates/action.cell.html',
    }];
  }

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : columns,
    enableSorting : true,
    showColumnFooter : true,
    onRegisterApi : onRegisterApiFn,
    fastWatch : true,
    flatEntityAccess : true,
  };

  vm.grouping = new Grouping(vm.gridOptions, true, 'depot_text', vm.grouped, true);

  // expose to the view
  vm.search = search;
  vm.openColumnConfigModal = openColumnConfigModal;
  vm.onRemoveFilter = onRemoveFilter;
  vm.getFluxName = getFluxName;
  vm.openReceiptModal = openReceiptModal;
  vm.toggleGroup = toggleGroup;
  vm.selectGroup = selectGroup;
  vm.getQueryString = getQueryString;
  vm.clearGridState = clearGridState;

  const gridColumns = new Columns(vm.gridOptions, cacheKey);
  const state = new GridState(vm.gridOptions, cacheKey);

  function getQueryString(options) {
    return stockMovementFilters.getQueryString(options);
  }

  // grid api
  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
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

  // generate document by type of flux
  function openReceiptModal(documentUuid, fluxId) {
    if (!mapFlux[fluxId]) { return; }
    mapFlux[fluxId].receipt(documentUuid);
  }

  // aggregation total cost
  function totalCost(items) {
    const total = items.reduce(processTotalCost, 0);
    return total;
  }

  function processTotalCost(previous, current) {
    return (current.entity.quantity * current.entity.unit_cost) + previous;
  }

  // on remove one filter
  function onRemoveFilter(key) {
    stockMovementFilters.remove(key);
    stockMovementFilters.formatCache();
    vm.latestViewFilters = stockMovementFilters.formatView();
    return load(stockMovementFilters.formatHTTP(true));
  }

  // This function opens a modal through column service to let the user toggle
  // the visibility of the lots registry's columns.
  function openColumnConfigModal() {
    // column configuration has direct access to the grid API to alter the current
    // state of the columns - this will be saved if the user saves the grid configuration
    gridColumns.openConfigurationModal();
  }

  vm.saveGridState = state.saveGridState;

  function clearGridState() {
    state.clearGridState();
    $state.reload();
  }

  // load stock lots in the grid
  function load(filters) {
    vm.hasError = false;
    vm.loading = true;

    Stock.movements.read(null, filters)
      .then(handleMovementRows)
      .catch(Notify.handleError)
      .finally(toggleLoading);
  }

  function orderByDepot(rowA, rowB) {
    return rowA.depot_text > rowB.depot_text ? 1 : -1;
  }

  function handleMovementRows(rows) {
    // FIXME(@jniles): we should do this ordering on the server via an ORDER BY
    rows.sort(orderByDepot);

    // preprocess data
    rows.forEach(handleMovementRow);

    vm.gridOptions.data = rows;

    // force expand grid
    vm.grouping.unfoldAllGroups();
  }

  function handleMovementRow(row) {
    // the column must be filtered on the translated text
    row.io = $translate.instant(row.is_exit === 0 ? 'STOCK.INPUT' : 'STOCK.OUTPUT');

    // compute the fluxName from its ID
    row.fluxName = getFluxName(row.flux_id);

    // compute the row cost
    row.cost = row.quantity * row.unit_cost;
  }

  function toggleLoading() {
    vm.loading = !vm.loading;
  }

  // search modal
  function search() {
    const filtersSnapshot = stockMovementFilters.formatHTTP();

    Modal.openSearchMovements(filtersSnapshot)
      .then(handleSearchModal);
  }

  function handleSearchModal(changes) {
    // if there is no change , customer filters should not change
    if (!changes) { return; }

    stockMovementFilters.replaceFilters(changes);
    stockMovementFilters.formatCache();
    vm.latestViewFilters = stockMovementFilters.formatView();
    load(stockMovementFilters.formatHTTP(true));
  }

  // get flux name
  function getFluxName(id) {
    return Flux.translate[id];
  }

  // initialize module
  function startup() {
    if ($state.params.filters.length) {
      stockMovementFilters.replaceFiltersFromState($state.params.filters);
      stockMovementFilters.formatCache();
    }

    load(stockMovementFilters.formatHTTP(true));
    vm.latestViewFilters = stockMovementFilters.formatView();
  }

  vm.downloadExcel = () => {
    const filterOpts = stockMovementFilters.formatHTTP();
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

  vm.toggleInlineFilter = () => {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };

  startup();
}
