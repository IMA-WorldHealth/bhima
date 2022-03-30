angular.module('bhima.controllers')
  .controller('RequiredInventoryScansRegistryController', RequiredInventoryScansRegistryController);

RequiredInventoryScansRegistryController.$inject = [
  'RequiredInventoryScansService', 'RequiredInventoryScansRegistryService',
  'StockModalService', 'DepotService',
  'GridStateService', 'GridColumnService', 'GridGroupingService',
  'NotifyService', '$state',
];

/**
 * Assets Registry Controller
 * This module is a registry page for assets
 */
function RequiredInventoryScansRegistryController(
  RequiredInventoryScans, ReqInvScansRegistryService,
  StockModal, Depots,
  GridState, Columns, Grouping,
  Notify, $state,
) {
  const vm = this;
  const cacheKey = 'required-inventory-scans-grid';

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : ReqInvScansRegistryService.columnDefs,
    enableSorting : true,
    showColumnFooter : true,
    fastWatch : true,
    flatEntityAccess : true,
    onRegisterApi,
  };

  const gridColumns = new Columns(vm.gridOptions, cacheKey);
  const state = new GridState(vm.gridOptions, cacheKey);

  // options for the UI grid
  vm.loading = false;
  vm.saveGridState = state.saveGridState;

  // expose to the view model
  vm.grouping = new Grouping(vm.gridOptions, false, 'depot_name', true, true);

  vm.filters = ReqInvScansRegistryService.filters;

  vm.defaultDepot = null;

  /**
   * Open the modal to change the depot
   */
  vm.openChangeDepotModal = () => {
    Depots.openSelectionModal(vm.defaultDepot, false, true)
      .then(depot => {
        vm.defaultDepot = depot || null;
        load(vm.filters.formatHTTP(true));
        vm.latestViewFilters = vm.filters.formatView();
      });
  };

  /**
   * initialize the module
   */
  function startup() {
    if ($state.params.filters.length) {
      vm.filters.replaceFiltersFromState($state.params.filters);
      vm.filters.formatCache();
    }
    load(vm.filters.formatHTTP(true));
    vm.latestViewFilters = vm.filters.formatView();
  }

  // load the assets scans into the grid
  function load(filters) {
    if (vm.defaultDepot) {
      filters.depot_uuid = vm.defaultDepot.uuid;
    }
    vm.hasError = false;
    toggleLoadingIndicator();
    RequiredInventoryScans.list(filters)
      .then(scans => {
        vm.gridOptions.data = scans;
        vm.grouping.unfoldAllGroups();
      })
      .catch(errorHandler)
      .finally(toggleLoadingIndicator);
  }

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  /**
   * remove a filter with from the filter object, save the filters and reload
   *
   * @param {string} key
   * @returns result of load
   */
  vm.onRemoveFilter = function onRemoveFilter(key) {
    vm.filters.removeFilter(key);
    vm.filters.formatCache();
    vm.latestViewFilters = vm.filters.formatView();
    return load(vm.filters.formatHTTP(true));
  };

  /**
   * @function errorHandler
   *
   * @description
   * Uses Notify to show an error in case the server sends back an information.
   * Triggers the error state on the grid.
   *
   * @param {object} error
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

  /**
   * Open Search modal
   */
  vm.search = function search() {
    const filtersSnapshot = vm.filters.formatHTTP();
    StockModal.openRequiredInventoryScansSearchModal(filtersSnapshot)
      .then((changes) => {
        vm.filters.replaceFilters(changes);
        vm.filters.formatCache();
        vm.latestViewFilters = vm.filters.formatView();
        return load(vm.filters.formatHTTP(true));
      });
  };

  /**
   * edit required inventory scan
   *
   * @param {object} obj
   */
  vm.editRequiredInventoryScan = (obj) => {
    StockModal.openRequiredInventoryScansEditModal({ uuid : obj.uuid })
      .then(ans => {
        if (!ans) { return; }
        load(vm.filters.formatHTTP(true));
      });
  };

  /**
   * Create a new required inventory scan
   */
  vm.createRequiredInventoryScan = () => {
    // defaults for the new required inventory scan
    const params = {
      uuid : null,
      depot_uuid : vm.defaultDepot?.uuid || null,
    };
    StockModal.openRequiredInventoryScansEditModal(params)
      .then(ans => {
        if (!ans) { return; }
        load(vm.filters.formatHTTP(true));
      });
  };

  // This function opens a modal through column service to let the user toggle
  // the visibility of the lots registry's columns.
  vm.openColumnConfigModal = function openColumnConfigModal() {
    // column configuration has direct access to the grid API to alter the current
    // state of the columns - this will be saved if the user saves the grid configuration
    gridColumns.openConfigurationModal();
  };

  // saves the grid's current configuration
  vm.clearGridState = function clearGridState() {
    state.clearGridState();
    $state.reload();
  };

  startup();
}
