angular.module('bhima.controllers')
  .controller('StockMovementsController', StockMovementsController);

StockMovementsController.$inject = [
  'StockService', 'NotifyService', 'uiGridConstants', '$translate',
  'StockModalService', 'LanguageService', 'SessionService', 'FluxService',
  'ReceiptModal', 'GridGroupingService', '$state', 'GridColumnService', 'GridStateService'
];

/**
 * Stock movements Controller
 * This module is a registry page for stock movements
 */
function StockMovementsController(Stock, Notify,
  uiGridConstants, $translate, Modal,
  Languages, Session, Flux, ReceiptModal, Grouping, $state, Columns, GridState) {
  var vm = this;
  var filterKey = 'movement';
  var cacheKey = 'movements-grid';
  var state;
  var gridColumns;

  vm.gridApi = {};

  // bind flux id with receipt
  var mapFlux = {
    1: { receipt: ReceiptModal.stockEntryPurchaseReceipt },
    2: { receipt: ReceiptModal.stockEntryDepotReceipt },
    3: { receipt: ReceiptModal.stockAdjustmentReceipt },
    8: { receipt: ReceiptModal.stockExitDepotReceipt },
    9: { receipt: ReceiptModal.stockExitPatientReceipt },
    10: { receipt: ReceiptModal.stockExitServiceReceipt },
    11: { receipt: ReceiptModal.stockExitLossReceipt },
    12: { receipt: ReceiptModal.stockAdjustmentReceipt },
    13: { receipt: ReceiptModal.stockEntryIntegrationReceipt },
  };

  // grouping box
  vm.groupingBox = [
    { label: 'STOCK.INVENTORY', value: 'text' },
    { label: 'STOCK.IO', value: 'io' },
    { label: 'STOCK.LOT', value: 'label' },
  ];

  // global variables
  vm.enterprise = Session.enterprise;

  // grid columns
  var columns = [
    {
      field: 'depot_text',
      displayName: 'STOCK.DEPOT',
      headerCellFilter: 'translate',
      aggregationType: uiGridConstants.aggregationTypes.count
    },

    {
      field: 'io',
      displayName: 'STOCK.IO',
      headerCellFilter: 'translate',
      cellTemplate: 'modules/stock/movements/templates/io.cell.html'
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
      aggregationType: uiGridConstants.aggregationTypes.sum,
      cellClass: 'text-right',
      footerCellClass: 'text-right'
    },

    {
      field: 'unit_type',
      width: 75,
      displayName: 'TABLE.COLUMNS.UNIT',
      headerCellFilter: 'translate',
      cellTemplate: 'modules/stock/inventories/templates/unit.tmpl.html'
    },

    {
      field: 'unit_cost',
      displayName: 'STOCK.UNIT_COST',
      headerCellFilter: 'translate',
      cellFilter: 'currency:grid.appScope.enterprise.currency_id',
      cellClass: 'text-right'
    },

    {
      field: 'cost',
      displayName: 'STOCK.COST',
      headerCellFilter: 'translate',
      aggregationType: totalCost,
      cellClass: 'text-right',
      cellTemplate: 'modules/stock/movements/templates/cost.cell.html',
      footerCellFilter: 'currency:grid.appScope.enterprise.currency_id',
      footerCellClass: 'text-right'
    },

    {
      field: 'date',
      displayName: 'FORM.LABELS.DATE',
      headerCellFilter: 'translate',
      cellFilter: 'date',
      cellClass: 'text-right'
    },

    {
      field: 'flux_id',
      displayName: 'STOCK.FLUX',
      headerCellFilter: 'translate',
      cellTemplate: 'modules/stock/movements/templates/flux.cell.html'
    },

    {
      field: 'action',
      displayName: '',
      enableFiltering: false,
      enableSorting: false,
      cellTemplate: 'modules/stock/movements/templates/action.cell.html'
    },
  ];

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider: vm,
    enableColumnMenus: false,
    columnDefs: columns,
    enableSorting: true,
    showColumnFooter: true,
    onRegisterApi: onRegisterApi,
    fastWatch: true,
    flatEntityAccess: true,
  };

  vm.grouping = new Grouping(vm.gridOptions, true, 'depot_text', vm.grouped, true);

  // expose to the view
  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.getFluxName = getFluxName;
  vm.openReceiptModal = openReceiptModal;
  vm.toggleGroup = toggleGroup;
  vm.selectGroup = selectGroup;
  vm.download = Stock.download;

  gridColumns = new Columns(vm.gridOptions, cacheKey);
  state = new GridState(vm.gridOptions, cacheKey);

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
    Stock.removeFilter(filterKey, key);

    Stock.cacheFilters(filterKey);
    vm.latestViewFilters = Stock.filter[filterKey].formatView();

    return load(Stock.filter[filterKey].formatHTTP(true));
  }

  // This function opens a modal through column service to let the user toggle
  // the visibility of the lots registry's columns.
  function openColumnConfigModal() {
    // column configuration has direct access to the grid API to alter the current
    // state of the columns - this will be saved if the user saves the grid configuration
    gridColumns.openConfigurationModal();
  };

  vm.saveGridState = state.saveGridState;

  function clearGridState() {
    state.clearGridState();
    $state.reload();
  };

  // load stock lots in the grid
  function load(filters) {
    vm.hasError = false;
    vm.loading = true;


    // var today = { defaultPeriod: 'today' };
    // var params = filters;

    // var noFilter = (!filters);
    // var noAttributes = (noFilter || (Object.keys(filters).length === 0));

    // if (noAttributes) {
    //   params = today;
    //   vm.isToday = true;
    //   vm.filters = { display: today, identifiers: today };
    //   vm.formatedFilters = SearchFilterFormat.formatDisplayNames(vm.filters.display);
    // }


    Stock.movements.read(null, filters).then(function (rows) {
      // set flux name
      rows.forEach(function (row) {
        row.fluxName = getFluxName(row.flux_id);
      });

      vm.gridOptions.data = rows;

      // force expand grid
      vm.grouping.unfoldAllGroups();
    })
    .catch(Notify.handleError)
    .finally(function () {
      vm.loading = false;
    });
  }

  // search modal
  function search() {
    Modal.openSearchMovements()
      .then(function (filters) {
        if (!filters) { return; }

        vm.isToday = false;
        reload(filters);
      })
      .catch(Notify.handleError);
  }

  // get flux name
  function getFluxName(id) {
    return Flux.translate[id];
  }

  // initialize module
  function startup() {

    if($state.params.filters) {
      var changes = [{ key : $state.params.filters.key, value : $state.params.filters.value }]
      Stock.filter[filterKey].replaceFilters(changes);		
      Stock.cacheFilters(filterKey);
    }

    load(Stock.filter[filterKey].formatHTTP(true));
    vm.latestViewFilters = Stock.filter[filterKey].formatView();
  }

  startup();
}
