angular.module('bhima.controllers')
  .controller('InventoryListController', InventoryListController);

// dependencies injection
InventoryListController.$inject = [
  'InventoryService', 'NotifyService', 'uiGridConstants',
  'ModalService', '$state', 'FilterService', 'appcache',
  'GridColumnService', 'GridStateService', 'GridExportService',
  'LanguageService', 'SessionService', '$rootScope',
];

/**
 * Inventory List Controllers
 * This controller is responsible of the inventory list module
 */
function InventoryListController(
  Inventory, Notify, uiGridConstants, Modal, $state, Filters, AppCache, Columns, GridState,
  GridExport, Languages, Session, $rootScope,
) {

  const vm = this;
  const cacheKey = 'InventoryGrid';
  const cache = new AppCache(cacheKey);

  // global variables
  vm.download = Inventory.download;
  vm.inventoryLogModal = inventoryLogModal;
  vm.lang = Languages.key;
  vm.filterEnabled = false;
  vm.gridOptions = {};
  vm.gridApi = {};

  // import
  vm.openImportInventoriesModal = openImportInventoriesModal;

  vm.loading = true;
  vm.remove = remove;

  // listner
  $rootScope.$on('INVENTORY_UPDATED', onInventoryUpdated);

  function onInventoryUpdated() {
    return load(Inventory.filters.formatHTTP());
  }

  // grid default options
  const columnDefs = [{
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
    cellTemplate : '/modules/inventory/list/templates/inventory.cell.html',
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
  },
  {
    field : 'note',
    displayName : 'FORM.INFO.NOTE',
    headerCellFilter : 'translate',
    cellClass : 'text-right',
    visible : false,
  }, {
    field : 'sellable',
    visible : false,
    displayName : 'INVENTORY.SELLABLE',
    headerCellFilter : 'translate',
    cellTemplate : '/modules/inventory/list/templates/sellable.cell.tmpl.html',
  }, {
    field : 'tagNames',
    displayName : 'TAG.LABEL',
    headerTooltip : 'TAG.LABEL',
    headerCellFilter : 'translate',
    cellTemplate     : 'modules/stock/lots/templates/tags.cell.html',
  }, {
    field : 'action',
    displayName : '',
    cellTemplate : '/modules/inventory/list/templates/action.cell.html',
    enableFiltering : false,
    enableSorting : false,
    enableColumnMenu : false,
  },
  ];

  vm.gridOptions = {
    appScopeProvider : vm,
    enableFiltering : vm.filterEnabled,
    enableColumnMenus : false,
    showColumnFooter : true,
    fastWatch : true,
    flatEntityAccess : true,
    columnDefs,
    onRegisterApi,
  };

  // configurations
  const gridColumns = new Columns(vm.gridOptions, cacheKey);
  const exportation = new GridExport(vm.gridOptions, 'visible', 'visible');
  const state = new GridState(vm.gridOptions, cacheKey);

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
    vm.gridOptions.data = (rows || []).map(inventory => {
      // serialize tag names for filters
      inventory.tagNames = inventory.tags.map(tag => tag.name).join(',');
      inventory.tags.forEach(addColorStyle);
      return inventory;
    });
  }

  function addColorStyle(tag) {
    tag.style = { color : tag.color };
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
    const filtersSnapshot = Inventory.filters.formatHTTP();
    return Inventory.openSearchModal(filtersSnapshot)
      .then(handleSearchResult);
  }

  function handleSearchResult(changes) {
    if (!changes) { return 0; }
    Inventory.filters.replaceFilters(changes);
    Inventory.cacheFilters();
    vm.latestViewFilters = Inventory.filters.formatView();
    return load(Inventory.filters.formatHTTP());
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
      .then((yes) => {
        if (!yes) {
          return;
        }
        Inventory.remove(uuid)
          .then(() => {
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

  /**
   * start the import of inventories from a csv file
  */
  function openImportInventoriesModal() {
    Inventory.openImportInventoriesModal()
      .catch(Notify.handleError);
  }

  function inventoryLogModal(uuid) {
    Modal.openinventoryLogModal({ uuid });
  }

}
