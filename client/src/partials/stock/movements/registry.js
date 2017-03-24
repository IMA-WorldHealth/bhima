angular.module('bhima.controllers')
.controller('StockMovementsController', StockMovementsController);

StockMovementsController.$inject = [
  '$state', 'StockService', 'NotifyService',
  'uiGridConstants', '$translate', 'StockModalService',
  'SearchFilterFormatService', 'LanguageService', 'SessionService',
  'FluxService', 'ReceiptModal', 'GridGroupingService', 'FilterService',
];

/**
 * Stock movements Controller
 * This module is a registry page for stock movements
 */
function StockMovementsController($state, Stock, Notify,
  uiGridConstants, $translate, Modal, SearchFilterFormat,
  Languages, Session, Flux, ReceiptModal, Grouping, Filters) {
  var vm = this;

  // bind flux id with receipt
  var mapFlux = {
    1  : { receipt: ReceiptModal.stockEntryPurchaseReceipt },
    2  : { receipt: ReceiptModal.stockEntryDepotReceipt },
    3  : { receipt: ReceiptModal.stockAdjustmentReceipt },
    8  : { receipt: ReceiptModal.stockExitDepotReceipt },
    9  : { receipt: ReceiptModal.stockExitPatientReceipt },
    10 : { receipt: ReceiptModal.stockExitServiceReceipt },
    11 : { receipt: ReceiptModal.stockExitLossReceipt },
    12 : { receipt: ReceiptModal.stockAdjustmentReceipt },
    13 : { receipt: ReceiptModal.stockEntryIntegrationReceipt },
  };

  // grouping box
  vm.groupingBox = [
    { label: 'STOCK.INVENTORY', value: 'text' },
    { label: 'STOCK.IO', value: 'io' },
    { label: 'STOCK.LOT', value: 'label' },
  ];

  // global variables
  vm.gridApi = {};
  vm.Filter = new Filters();
  vm.filters = { lang: Languages.key };
  vm.formatedFilters = [];
  vm.enterprise = Session.enterprise;

  // grid columns
  var columns = [
    { field            : 'depot_text',
      displayName      : 'STOCK.DEPOT',
      headerCellFilter : 'translate',
      aggregationType  : uiGridConstants.aggregationTypes.count },
    { field            : 'io',
      displayName      : 'STOCK.IO',
      headerCellFilter : 'translate',
      cellTemplate     : 'partials/stock/movements/templates/io.cell.html',
    },
      { field: 'text', displayName: 'STOCK.INVENTORY', headerCellFilter: 'translate' },
      { field: 'label', displayName: 'STOCK.LOT', headerCellFilter: 'translate' },
    { field            : 'quantity',
      displayName      : 'STOCK.QUANTITY',
      headerCellFilter : 'translate',
      aggregationType  : uiGridConstants.aggregationTypes.sum,
      cellClass        : 'text-right',
      footerCellClass  : 'text-right',
    },
    { field            : 'unit_cost',
      displayName      : 'STOCK.UNIT_COST',
      headerCellFilter : 'translate',
      cellFilter       : 'currency:grid.appScope.enterprise.currency_id',
      cellClass        : 'text-right',
    },
    { field            : 'cost',
      displayName      : 'STOCK.COST',
      headerCellFilter : 'translate',
      aggregationType  : totalCost,
      cellClass        : 'text-right',
      cellTemplate     : 'partials/stock/movements/templates/cost.cell.html',
      footerCellFilter : 'currency:grid.appScope.enterprise.currency_id',
      footerCellClass  : 'text-right',
    },
    { field            : 'date',
      displayName      : 'FORM.LABELS.DATE',
      headerCellFilter : 'translate',
      cellFilter       : 'date',
      cellClass        : 'text-right' },
    { field            : 'flux_id',
      displayName      : 'STOCK.FLUX',
      headerCellFilter : 'translate',
      cellTemplate     : 'partials/stock/movements/templates/flux.cell.html' },
    { field           : 'action',
      displayName     : '',
      enableFiltering : false,
      enableSorting   : false,
      cellTemplate    : 'partials/stock/movements/templates/action.cell.html' },
  ];

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    columnDefs        : columns,
    enableSorting     : true,
    showColumnFooter  : true,
    onRegisterApi     : onRegisterApi,
  };

  vm.grouping = new Grouping(vm.gridOptions, true, 'depot_text', vm.grouped, true);

  // expose to the view
  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.clearFilters = clearFilters;
  vm.getFluxName = getFluxName;
  vm.openReceiptModal = openReceiptModal;
  vm.toggleGroup = toggleGroup;
  vm.selectGroup = selectGroup;

  // grid api
  function onRegisterApi(gridApi) {
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
    var total = items.reduce(function (previous, current) {
      return (current.entity.quantity * current.entity.unit_cost) + previous;
    }, 0);
    return total;
  }

  // on remove one filter
  function onRemoveFilter(key) {
    SearchFilterFormat.onRemoveFilter(key, vm.filters, reload);
  }

  // clear all filters
  function clearFilters() {
    SearchFilterFormat.clearFilters(reload);
  }

  // init filters
  function initFilters(filters) {
    var appliedFilters = vm.Filter.applyDefaults(filters || {});
    vm.filters = { display: appliedFilters, identifiers: appliedFilters };
    vm.formatedFilters = SearchFilterFormat.formatDisplayNames(vm.filters.display);
    return appliedFilters;
  }

  // load stock lots in the grid
  function load(filters) {
    var params = initFilters(filters);

    Stock.movements.read(null, params).then(function (rows) {
      vm.gridOptions.data = rows;
    })
    .catch(Notify.handleError);
  }

  // search modal
  function search() {
    Modal.openSearchMovements()
    .then(function (filters) {
      if (!filters) { return; }
      load(filters.identifiers);
    })
    .catch(Notify.handleError);
  }

  // reload
  function reload(filters) {
    load(filters.identifiers);
  }

  // get flux name
  function getFluxName(id) {
    return Flux.translate[id];
  }

  load();
}
