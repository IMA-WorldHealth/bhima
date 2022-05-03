angular.module('bhima.controllers')
  .controller('ShipmentRegistryController', ShipmentRegistryController);

ShipmentRegistryController.$inject = [
  '$state', 'ShipmentService', 'ShipmentFilter', 'ShipmentModalService',
  'ModalService', 'NotifyService', 'uiGridConstants',
  'GridStateService', 'GridColumnService', 'bhConstants',
];

function ShipmentRegistryController(
  $state, Shipments, ShipmentFilter, ShipmentModal,
  Modal, Notify, GridConstants,
  GridState, Columns, Constants,
) {
  const vm = this;
  const cacheKey = 'shipment-grid';
  const shipmentFilters = new ShipmentFilter();

  // bind methods
  vm.getOverview = getOverview;
  vm.setReady = setReady;
  vm.setTrackingLog = updateTrackingLogModal;
  vm.setComplete = setComplete;

  vm.deleteShipment = deleteShipment;
  vm.editShipment = editShipment;
  vm.createShipment = createShipment;
  vm.toggleFilter = toggleFilter;
  vm.onRemoveFilter = onRemoveFilter;
  vm.search = search;
  vm.shipmentOverview = shipmentOverview;
  vm.getShipmentBarcode = getShipmentBarcode;
  vm.gotoStockEntry = gotoStockEntry;
  vm.gotoStockExit = gotoStockExit;

  // global variables
  vm.gridApi = {};

  // registry columns
  const columnDefs = [
    {
      field : 'status',
      displayName : 'TABLE.COLUMNS.STATUS',
      headerTooltip : 'TABLE.COLUMNS.STATUS',
      headerCellFilter : 'translate',
      cellFilter : 'translate',
    },
    {
      field : 'reference',
      displayName : 'SHIPMENT.REFERENCE',
      headerTooltip : 'SHIPMENT.REFERENCE',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
    },
    {
      field : 'stock_reference',
      displayName : 'FORM.LABELS.REFERENCE_STOCK_MOVEMENT',
      headerTooltip : 'FORM.LABELS.REFERENCE_STOCK_MOVEMENT',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
    },
    {
      field : 'name',
      displayName : 'TABLE.COLUMNS.NAME',
      headerTooltip : 'TABLE.COLUMNS.NAME',
      headerCellFilter : 'translate',
    },
    {
      field : 'description',
      displayName : 'TABLE.COLUMNS.DESCRIPTION',
      headerTooltip : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
    },
    {
      field : 'origin_depot',
      displayName : 'SHIPMENT.ORIGIN_DEPOT',
      headerTooltip : 'SHIPMENT.ORIGIN_DEPOT',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
    },
    {
      field : 'destination_depot',
      displayName : 'SHIPMENT.DESTINATION_DEPOT',
      headerTooltip : 'SHIPMENT.DESTINATION_DEPOT',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
    },
    {
      field : 'date_sent',
      displayName : 'SHIPMENT.DATE_SENT',
      headerTooltip : 'SHIPMENT.DATE_SENT',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
      cellFilter : 'date',
    },
    {
      field : 'date_delivered',
      displayName : 'SHIPMENT.DATE_DELIVERED',
      headerTooltip : 'SHIPMENT.DATE_DELIVERED',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
      cellFilter : 'date',
    },
    {
      field : 'anticipated_delivery_date',
      displayName : 'SHIPMENT.ANTICIPATED_DELIVERY_DATE',
      headerTooltip : 'SHIPMENT.ANTICIPATED_DELIVERY_DATE',
      headerCellClass : 'wrappingColHeader',
      headerCellFilter : 'translate',
      cellFilter : 'date',
    },
    {
      field : 'created_by',
      displayName : 'SHIPMENT.CREATED_BY',
      headerTooltip : 'SHIPMENT.CREATED_BY',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
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

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    showColumnFooter  : true,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    showTreeExpandNoChildren : false,
    onRegisterApi,
    columnDefs,
  };

  const gridColumns = new Columns(vm.gridOptions, cacheKey);
  const state = new GridState(vm.gridOptions, cacheKey);

  vm.saveGridState = state.saveGridState;
  vm.openColumnConfigModal = openColumnConfigModal;
  vm.clearGridState = clearGridState;

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

  function openColumnConfigModal() {
    gridColumns.openConfigurationModal();
  }

  function clearGridState() {
    state.clearGridState();
    $state.reload();
  }

  function shipmentOverview(uuid) {
    return ShipmentModal.openShipmentOverview(uuid);
  }

  function getOverview(uuid) {
    return ShipmentModal.shipmentOverviewModal(uuid);
  }

  function setReady(uuid) {
    return ShipmentModal.setReadyForShipmentModal(uuid);
  }

  function setComplete(uuid) {
    return ShipmentModal.setShipmentCompletedModal(uuid);
  }

  function updateTrackingLogModal(uuid) {
    return ShipmentModal.updateTrackingLogModal(uuid);
  }

  function getShipmentBarcode(uuid) {
    return ShipmentModal.openShipmentBarcode(uuid);
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
        vm.gridOptions.data = data.map(item => {
          item.isAtDepot = item.status_id === Constants.shipmentStatus.AT_DEPOT;
          item.isReady = item.status_id === Constants.shipmentStatus.READY_FOR_SHIPMENT;
          item.inTransit = item.status_id === Constants.shipmentStatus.IN_TRANSIT;
          item.isPartial = item.status_id === Constants.shipmentStatus.PARTIAL;
          item.isComplete = item.status_id === Constants.shipmentStatus.COMPLETE;
          // @TODO: Handle EMPTY, DELIVERED, LOST
          return item;
        });
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

  function gotoStockEntry(shipmentUuid) {
    $state.go('stockEntry', { shipment : shipmentUuid });
  }

  function gotoStockExit(shipmentUuid) {
    $state.go('stockExit', { shipment : shipmentUuid });
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

  vm.exportTo = (renderer) => {
    return Shipments.exportTo(renderer, shipmentFilters);
  };

  vm.downloadExcel = () => {
    return Shipments.downloadExcel(shipmentFilters, gridColumns);
  };

  startup();
}
