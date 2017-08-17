angular.module('bhima.controllers')
  .controller('InventoryListController', InventoryListController);

// dependencies injection
InventoryListController.$inject = [
  '$translate', 'InventoryService', 'NotifyService', 'uiGridConstants',
  'ModalService', '$state', '$rootScope', 'appcache',
  'SearchFilterService', 'GridColumnService', 'GridStateService',
  'GridExportService', 'LanguageService',
];

/**
 * Inventory List Controllers
 * This controller is responsible of the inventory list module
 */
function InventoryListController($translate, Inventory, Notify, uiGridConstants,
  Modal, $state, $rootScope, AppCache,
  SearchFilters, Columns, GridState, GridExport, Languages) {
  var vm = this;
  var cacheKey = 'InventoryGrid';
  var cache = new AppCache(cacheKey);

  var gridColumns;
  var exportation;
  var columnDefs;
  var state;
  var search = new SearchFilters(cacheKey);

  // global variables
  vm.lang = Languages.key;
  vm.filterEnabled = false;
  vm.gridOptions = {};
  vm.gridApi = {};

  vm.loading = true;


  // grid default options
  columnDefs = [
    { field : 'code',
      displayName : 'FORM.LABELS.CODE',
      headerCellFilter : 'translate',
      aggregationType : uiGridConstants.aggregationTypes.count,
      aggregationHideLabel : true,
    },

    { field : 'consumable',
      displayName : 'FORM.LABELS.CONSUMABLE',
      headerCellFilter : 'translate',
      cellTemplate : '/modules/inventory/list/templates/consumable.cell.tmpl.html',
    },

    { field : 'groupName', displayName : 'FORM.LABELS.GROUP', headerCellFilter : 'translate' },

    { field : 'label', displayName : 'FORM.LABELS.LABEL', headerCellFilter : 'translate' },

    { field : 'price',
      displayName : 'FORM.LABELS.UNIT_PRICE',
      headerCellFilter : 'translate',
      cellClass : 'text-right',
      type : 'number',
    },

    { field : 'default_quantity',
      displayName : 'FORM.LABELS.DEFAULT_QUANTITY',
      headerCellFilter : 'translate',
      cellClass : 'text-right',
      type : 'number',
    },

    { field : 'type', displayName : 'FORM.LABELS.TYPE', headerCellFilter : 'translate' },

    { field : 'unit', displayName : 'FORM.LABELS.UNIT', headerCellFilter : 'translate' },

    { field : 'unit_weight',
      displayName : 'FORM.LABELS.WEIGHT',
      headerCellFilter : 'translate',
      cellClass : 'text-right',
      type : 'number',
      visible : false,
    },

    { field : 'unit_volume',
      displayName : 'FORM.LABELS.VOLUME',
      headerCellFilter : 'translate',
      cellClass : 'text-right',
      type : 'number',
      visible : false,
    },

    {
      field : 'action',
      displayName : '',
      cellTemplate : '/modules/inventory/list/templates/action.cell.html',
      enableFiltering : false,
      enableSorting : false,
      enableColumnMenu : false,
    }];

  vm.gridOptions = {
    appScopeProvider : vm,
    enableFiltering  : vm.filterEnabled,
    showColumnFooter : true,
    fastWatch : true,
    flatEntityAccess : true,
    columnDefs : columnDefs,
    onRegisterApi : onRegisterApi,
  };

  // configurations
  gridColumns = new Columns(vm.gridOptions, cacheKey);
  exportation = new GridExport(vm.gridOptions, 'visible', 'visible');
  state = new GridState(vm.gridOptions, cacheKey);

  // expose methods and object
  vm.searchFilter = search;
  vm.saveGridState = state.saveGridState;
  vm.openColumnConfigModal = openColumnConfigModal;
  vm.clearGridState = clearGridState;
  vm.clearFilters = clearFilters;
  vm.onRemoveFilter = onRemoveFilter;

  vm.toggleFilter = toggleFilter;
  vm.research = research;
  vm.exportCsv = exportCsv;

  // API register function
  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  /** initial setting start */
  startup();

  /** enable filter */
  function toggleFilter() {
    cache.filterEnabled = !vm.filterEnabled;
    vm.filterEnabled = cache.filterEnabled;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  function runResearch(params) {

    if (params) {
      search.assignFilters(params);
      vm.latestViewFilters = search.latestViewFilters();
      vm.hasCustomFilters = search.hasCustomFilters();
      vm.parameters = JSON.stringify(params);
    }

    vm.loading = true;
    vm.hasError = false;

    Inventory.read(null, params)
      .then(function (rows) {
        vm.gridOptions.data = rows;
      })
      .catch(function (exception) {
        vm.hasError = true;
        Notify.handleError(exception);
      })
      .finally(function () {
        vm.loading = false; // this will execute after the data is downloaded.
      });
  }


  // research and filter data in Inventory List
  function research() {
    Inventory.openSearchModal()
      .then(function (parameters) {
        if (!parameters) { return; }

        runResearch(parameters);
      });
  }

  // remove a filter with from the filter object, save the filters and reload
  function onRemoveFilter(key) {
    $state.params.filters = null;

    search.removeFilter(key);
    runResearch(search.getParameters());
  }

  // clears the filters
  function clearFilters() {
    startup();
    $state.params.filters = null;

    search.clearFilters();
    vm.latestViewFilters = search.latestViewFilters();
    vm.hasCustomFilters = search.hasCustomFilters();
    runResearch();
  }

  // startup
  function startup() {
    // if filters are directly passed in
    runResearch(search.getParameters());

    // load the cached filter state
    vm.filterEnabled = cache.filterEnabled || false;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
  }

  // clear grid state
  function clearGridState() {
    state.clearGridState();
    $state.reload();
  }

  // column config
  function openColumnConfigModal() {
    gridColumns.openConfigurationModal();
  }

  // export csv
  function exportCsv() {
    exportation.run();
  }
}
