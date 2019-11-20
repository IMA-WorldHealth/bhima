angular.module('bhima.controllers')
  .controller('DepotManagementController', DepotManagementController);

DepotManagementController.$inject = [
  'DepotService', 'ModalService', 'NotifyService', 'uiGridConstants', '$state',
  'StockService', 'StockModalService',
];

/**
 * Depot Management Controller
 *
 * This controller is about the depot management module in the admin zone
 * It's responsible for creating, editing and updating a depot
 */
function DepotManagementController(
  Depots, ModalService, Notify, uiGridConstants, $state, Stock, Modal
) {
  const vm = this;

  const stockDepotFilters = Stock.filter.depot;

  // bind methods
  vm.deleteDepot = deleteDepot;
  vm.editDepot = editDepot;
  vm.createDepot = createDepot;
  vm.toggleFilter = toggleFilter;
  vm.onRemoveFilter = onRemoveFilter;
  vm.search = search;

  // global variables
  vm.gridApi = {};

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    onRegisterApi     : onRegisterApiFn,
    columnDefs : [
      {
        field : 'text',
        displayName : 'DEPOT.LABEL',
        headerCellFilter : 'translate',
        cellTemplate : '/modules/depots/templates/label.tmpl.html',
      },
      {
        field : 'location',
        displayName : 'DEPOT.LOCATION',
        headerCellFilter : 'translate',
        cellTemplate : '/modules/depots/templates/location.tmpl.html',
      },
      {
        field : 'is_warehouse',
        width : 125,
        displayName : 'DEPOT.WAREHOUSE',
        headerCellFilter : 'translate',
        cellTemplate : '/modules/depots/templates/warehouse.tmpl.html',
        enableSorting : false,
        enableFiltering : false,
      },
      {
        field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/depots/templates/action.tmpl.html',
        enableSorting : false,
        enableFiltering : false,
      },
    ],
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function toggleFilter() {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  // on remove one filter
  function onRemoveFilter(key) {
    stockDepotFilters.remove(key);
    stockDepotFilters.formatCache();
    vm.latestViewFilters = stockDepotFilters.formatView();
    return load(stockDepotFilters.formatHTTP(true));
  }

  // search modal
  function search() {
    const filtersSnapshot = stockDepotFilters.formatHTTP();
    Modal.openSearchDepots(filtersSnapshot)
      .then(handleSearchModal);
  }

  function handleSearchModal(changes) {
    // if there is no change , customer filters should not change
    if (!changes) { return; }

    stockDepotFilters.replaceFilters(changes);
    stockDepotFilters.formatCache();
    vm.latestViewFilters = stockDepotFilters.formatView();
    load(stockDepotFilters.formatHTTP(true));
  }

  function load(filters = {}) {
    angular.extend(filters, { full : 1 });
    vm.loading = true;

    Depots.read(null, filters)
      .then(data => {
        // format location
        vm.gridOptions.data = data.map(item => {
          item.location = item.location_uuid
            ? ''.concat(`${item.village_name} / ${item.sector_name} / ${item.province_name} `)
              .concat(`(${item.country_name})`) : '';
          return item;
        });
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  // switch to delete warning mode
  function deleteDepot(depot) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(bool => {
        if (!bool) { return; }

        Depots.delete(depot.uuid)
          .then(() => {
            Notify.success('DEPOT.DELETED');
            load();
          })
          .catch(Notify.handleError);
      });
  }

  // update an existing depot
  function editDepot(depotObject) {
    $state.go('depots.edit', { depot : depotObject });
  }

  // create a new depot
  function createDepot() {
    $state.go('depots.create');
  }

  // initialize module
  function startup() {
    if ($state.params.filters && $state.params.filters.length) {
      stockDepotFilters.replaceFiltersFromState($state.params.filters);
      stockDepotFilters.formatCache();
    }

    load(stockDepotFilters.formatHTTP(true));
    vm.latestViewFilters = stockDepotFilters.formatView();
  }

  startup();
}
