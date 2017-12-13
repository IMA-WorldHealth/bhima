angular.module('bhima.controllers')
  .controller('InventoryListController', InventoryListController);

// dependencies injection
InventoryListController.$inject = [
  'InventoryService', 'NotifyService', 'uiGridConstants', 'ModalService',
  '$state', 'FilterService', 'appcache', 'GridColumnService', 'GridStateService',
  'GridExportService', 'LanguageService', 'SessionService', '$rootScope',
];

/**
 * Inventory List Controllers
 * This controller is responsible of the inventory list module
 */
function InventoryListController(
  Inventory, Notify, uiGridConstants, Modal, $state, Filters, AppCache, Columns, GridState,
  GridExport, Languages, Session, $rootScope
) {
  var vm = this;
  var cacheKey = 'InventoryGrid';
  var cache = new AppCache(cacheKey);

  var gridColumns;
  var exportation;
  var columnDefs;
  var state;

  // global variables
  vm.download = Inventory.download;
  vm.lang = Languages.key;
  vm.filterEnabled = false;
  vm.gridOptions = {};
  vm.gridApi = {};

  vm.loading = true;
  vm.remove = remove;

  // listner
  $rootScope.$on('INVENTORY_UPDATED', onInventoryUpdated);

  function onInventoryUpdated() {
    load(Inventory.filters.formatHTTP(true));
  }

  // grid default options
  columnDefs = [{
    field : 'code',
    displayName : 'FORM.LABELS.CODE',
    headerCellFilter : 'translate',
    aggregationType : uiGridConstants.aggregationTypes.count,
    aggregationHideLabel : true,
  }, {
    field : 'consumable',
    displayName : 'FORM.LABELS.CONSUMABLE',
    headerCellFilter : 'translate',
    cellTemplate : '/modules/inventory/list/templates/consumable.cell.tmpl.html',
  }, {
    field : 'groupName',
    displayName : 'FORM.LABELS.GROUP',
    headerCellFilter : 'translate',
  }, {
    field : 'label',
    displayName : 'FORM.LABELS.LABEL',
    headerCellFilter : 'translate',
  }, {
    field : 'price',
    displayName : 'FORM.LABELS.UNIT_PRICE',
    headerCellFilter : 'translate',
    cellClass : 'text-right',
    cellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    type : 'number',
  }, {
    field : 'default_quantity',
    displayName : 'FORM.LABELS.DEFAULT_QUANTITY',
    headerCellFilter : 'translate',
    cellClass : 'text-right',
    type : 'number',
  }, {
    field : 'type',
    displayName : 'FORM.LABELS.TYPE',
    headerCellFilter : 'translate',
  }, {
    field : 'unit',
    displayName : 'FORM.LABELS.UNIT',
    headerCellFilter : 'translate',
  }, {
    field : 'unit_weight',
    displayName : 'FORM.LABELS.WEIGHT',
    headerCellFilter : 'translate',
    cellClass : 'text-right',
    type : 'number',
    visible : false,
  }, {
    field : 'unit_volume',
    displayName : 'FORM.LABELS.VOLUME',
    headerCellFilter : 'translate',
    cellClass : 'text-right',
    type : 'number',
    visible : false,
  }, {
    field : 'action',
    displayName : '',
    cellTemplate : '/modules/inventory/list/templates/action.cell.html',
    enableFiltering : false,
    enableSorting : false,
    enableColumnMenu : false,
  }];

  vm.gridOptions = {
    appScopeProvider : vm,
    enableFiltering : vm.filterEnabled,
    enableColumnMenus : false,
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
  vm.saveGridState = state.saveGridState;
  vm.openColumnConfigModal = openColumnConfigModal;
  vm.clearGridState = clearGridState;
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

  function load(params) {
    vm.loading = true;
    vm.hasError = false;

    Inventory.read(null, params)
      .then(handleInventoryResult)
      .catch(handleException)
      .finally(toggleLoading);
  }

  function handleInventoryResult(rows) {
    vm.gridOptions.data = rows;
  }

  function handleException(exception) {
    vm.hasError = true;
    Notify.handleError(exception);
  }

  function toggleLoading() {
    vm.loading = !vm.loading;
  }

  // research and filter data in Inventory List
  function research() {
    var filtersSnapshot = Inventory.filters.formatHTTP();

    Inventory.openSearchModal(filtersSnapshot)
      .then(handleSearchResult);
  }

  function handleSearchResult(changes) {
    Inventory.filters.replaceFilters(changes);
    Inventory.cacheFilters();
    vm.latestViewFilters = Inventory.filters.formatView();
    return load(Inventory.filters.formatHTTP(true));
  }

  // remove a filter with from the filter object, save the filters and reload
  function onRemoveFilter(key) {
    Inventory.removeFilter(key);
    Inventory.cacheFilters();
    vm.latestViewFilters = Inventory.filters.formatView();
    return load(Inventory.filters.formatHTTP(true));
  }


  function startup() {
    // if parameters are passed through the $state object, use them.
    if ($state.params.filters && $state.params.filters.length) {
      Inventory.filters.replaceFiltersFromState($state.params.filters);
    }

    load(Inventory.filters.formatHTTP(true));
    vm.latestViewFilters = Inventory.filters.formatView();

    // load the cached inline filter state
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
  // delete an invetory from the database
  function remove(uuid) {
    Modal.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(function (yes) {
        if (!yes) {
          return;
        }
        Inventory.remove(uuid)
        .then(function (res) {
          startup();
          Notify.success('FORM.INFO.DELETE_SUCCESS');
        })
        .catch(Notify.handleError);
      });
  }
  // export csv
  function exportCsv() {
    exportation.run();
  }
}
