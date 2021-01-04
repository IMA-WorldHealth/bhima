angular.module('bhima.controllers')
  .controller('StockMovementsController', StockMovementsController);

StockMovementsController.$inject = [
  'StockService', 'NotifyService', 'uiGridConstants',
  'StockModalService', 'LanguageService', 'SessionService', 'FluxService',
  'ReceiptModal', 'GridGroupingService', '$state', 'GridColumnService', 'GridStateService', '$httpParamSerializer',
  '$translate', 'bhConstants',
];

/**
 * Stock movements registry Controller
 * This module is a registry page for stock movements
 * where each line represent a single movement
 */
function StockMovementsController(
  Stock, Notify, uiGridConstants, Modal,
  Languages, Session, Flux, ReceiptModal, Grouping, $state, Columns, GridState, $httpParamSerializer,
  $translate, bhConstants,
) {
  const vm = this;
  const cacheKey = 'movements-grid';
  const stockMovementsFilters = Stock.filter.movements;

  // grid columns
  const columns = getGridColumns();

  // add in FLUX identifiers
  vm.flux = bhConstants.flux;

  // grouping box
  vm.groupingBox = [
    { label : 'STOCK.IO', value : 'io' },
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
      field : 'documentReference',
      displayName : 'TABLE.COLUMNS.REFERENCE',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/movements/templates/reference.cell.html',
    }, {
      field : 'io',
      displayName : 'STOCK.IO',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/movements/templates/io.cell.html',
    }, {
      field : 'cost',
      type : 'number',
      displayName : 'STOCK.COST',
      headerCellFilter : 'translate',
      cellFilter : 'currency:grid.appScope.enterprise.currency_id',
      cellClass : 'text-right',
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
  vm.openReceiptModal = (uuid, fluxId) => ReceiptModal.getReceiptFnByFluxId(fluxId)(uuid);
  vm.toggleGroup = toggleGroup;
  vm.selectGroup = selectGroup;
  vm.getQueryString = getQueryString;
  vm.clearGridState = clearGridState;

  const gridColumns = new Columns(vm.gridOptions, cacheKey);
  const state = new GridState(vm.gridOptions, cacheKey);

  function getQueryString(options) {
    return stockMovementsFilters.getQueryString(options);
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

  // on remove one filter
  function onRemoveFilter(key) {
    stockMovementsFilters.remove(key);
    stockMovementsFilters.formatCache();
    vm.latestViewFilters = stockMovementsFilters.formatView();
    return load(stockMovementsFilters.formatHTTP(true));
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

    Stock.inlineMovements.read(null, filters)
      .then(handleMovementRows)
      .catch(Notify.handleError)
      .finally(toggleLoading);
  }

  function handleMovementRows(rows) {
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
  }

  function toggleLoading() {
    vm.loading = !vm.loading;
  }

  // search modal
  function search() {
    const filtersSnapshot = stockMovementsFilters.formatHTTP();

    Modal.openSearchMovements(filtersSnapshot)
      .then(handleSearchModal);
  }

  function handleSearchModal(changes) {
    // if there is no change , customer filters should not change
    if (!changes) { return; }

    stockMovementsFilters.replaceFilters(changes);
    stockMovementsFilters.formatCache();
    vm.latestViewFilters = stockMovementsFilters.formatView();
    load(stockMovementsFilters.formatHTTP(true));
  }

  // get flux name
  function getFluxName(id) {
    return Flux.translate[id];
  }

  // initialize module
  function startup() {
    if ($state.params.filters.length) {
      stockMovementsFilters.replaceFiltersFromState($state.params.filters);
      stockMovementsFilters.formatCache();
    }

    load(stockMovementsFilters.formatHTTP(true));
    vm.latestViewFilters = stockMovementsFilters.formatView();
  }

  vm.downloadExcel = () => {
    const filterOpts = stockMovementsFilters.formatHTTP();
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
