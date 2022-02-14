angular.module('bhima.controllers')
  .controller('ShipmentRegistryController', ShipmentRegistryController);

ShipmentRegistryController.$inject = [
  '$state', 'ShipmentService', 'ShipmentFilter', 'ShipmentModalService',
  'ModalService', 'NotifyService', 'uiGridConstants',
];

function ShipmentRegistryController(
  $state, Shipments, ShipmentFilter, ShipmentModal, Modal, Notify, GridConstants,
) {
  const vm = this;

  const shipmentFilters = new ShipmentFilter();

  // bind methods
  vm.deleteShipment = deleteShipment;
  vm.editShipment = editShipment;
  vm.createShipment = createShipment;
  vm.toggleFilter = toggleFilter;
  vm.onRemoveFilter = onRemoveFilter;
  vm.search = search;

  // global variables
  vm.gridApi = {};

  // registry columns
  const columnDefs = [
    {
      field : 'status',
      displayName : 'TABLE.COLUMNS.STATUS',
      headerCellFilter : 'translate',
      cellFilter : 'translate',
      // cellTemplate : '/modules/shipment/templates/status.cell.html',
    },
    {
      field : 'reference',
      displayName : 'SHIPMENT.REFERENCE',
      headerCellFilter : 'translate',
      // cellTemplate : '/modules/shipment/templates/reference.cell.html',
    },
    {
      field : 'stock_reference',
      displayName : 'SHIPMENT.STOCK_REFERENCE',
      headerCellFilter : 'translate',
      // cellTemplate : '/modules/shipment/templates/reference.cell.html',
    },
    {
      field : 'name',
      displayName : 'TABLE.COLUMNS.NAME',
      headerCellFilter : 'translate',
    },
    {
      field : 'description',
      displayName : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter : 'translate',
    },
    {
      field : 'shipper',
      displayName : 'SHIPMENT.SHIPPER',
      headerCellFilter : 'translate',
    },
    {
      field : 'origin_depot',
      displayName : 'SHIPMENT.ORIGIN_DEPOT',
      headerCellFilter : 'translate',
    },
    {
      field : 'current_depot',
      displayName : 'SHIPMENT.CURRENT_DEPOT',
      headerCellFilter : 'translate',
    },
    {
      field : 'destination_depot',
      displayName : 'SHIPMENT.DESTINATION_DEPOT',
      headerCellFilter : 'translate',
    },
    {
      field : 'date_sent',
      displayName : 'SHIPMENT.DATE_SENT',
      headerCellFilter : 'translate',
      cellFilter : 'date',
    },
    {
      field : 'date_delivered',
      displayName : 'SHIPMENT.DATE_DELIVERED',
      headerCellFilter : 'translate',
      cellFilter : 'date',
    },
    {
      field : 'anticipated_delivery_date',
      displayName : 'SHIPMENT.ANTICIPATED_DELIVERY_DATE',
      headerCellFilter : 'translate',
      cellFilter : 'date',
    },
    {
      field : 'receiver',
      displayName : 'SHIPMENT.RECEIVER',
      headerCellFilter : 'translate',
    },
    {
      field : 'created_by',
      displayName : 'SHIPMENT.CREATED_BY',
      headerCellFilter : 'translate',
    },
    {
      field : 'action',
      width : 80,
      displayName : '',
      cellTemplate : '/modules/shipment/templates/action.tmpl.html',
      enableSorting : false,
      enableFiltering : false,
    },
  ];

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    showColumnFooter  : true,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    showTreeExpandNoChildren : false,
    onRegisterApi     : onRegisterApiFn,
    columnDefs,
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function toggleFilter() {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(GridConstants.dataChange.COLUMN);
  }

  // on remove one filter
  function onRemoveFilter(key) {
    shipmentFilters.remove(key);
    shipmentFilters.formatCache();
    vm.latestViewFilters = shipmentFilters.formatView();
    return load(shipmentFilters.formatHTTP(true));
  }

  // search modal
  function search() {
    const filtersSnapshot = shipmentFilters.formatHTTP();
    ShipmentModal.openSearchShipment(filtersSnapshot)
      .then(handleSearchModal);
  }

  function handleSearchModal(changes) {
    // if there is no change , customer filters should not change
    if (!changes) { return; }

    shipmentFilters.replaceFilters(changes);
    shipmentFilters.formatCache();
    vm.latestViewFilters = shipmentFilters.formatView();
    load(shipmentFilters.formatHTTP(true));
  }

  function load(filters = {}) {
    vm.loading = true;

    Shipments.read(null, filters)
      .then(data => {
        vm.gridOptions.data = data;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  // switch to delete warning mode
  function deleteShipment(uuid) {
    Modal.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(bool => {
        if (!bool) { return; }

        Shipments.delete(uuid)
          .then(() => {
            Notify.success('SHIPMENT.DELETED');
            load();
          })
          .catch(Notify.handleError);
      });
  }

  // update an existing shipment
  function editShipment(uuid) {
    $state.go('shipments.edit', { uuid });
  }

  // create a new shipment
  function createShipment() {
    $state.go('shipments.create');
  }

  // initialize module
  function startup() {
    if ($state.params.filters && $state.params.filters.length) {
      shipmentFilters.replaceFiltersFromState($state.params.filters);
      shipmentFilters.formatCache();
    }

    load(shipmentFilters.formatHTTP(true));
    vm.latestViewFilters = shipmentFilters.formatView();
  }

  startup();
}
