angular.module('bhima.controllers')
  .controller('CreateShipmentController', CreateShipmentController);

// dependencies injections
CreateShipmentController.$inject = [
  '$state', 'NotifyService', 'SessionService', 'util',
  'StockFormService', 'StockService',
  'uiGridConstants', 'Store', 'BarcodeService',
  'ShipmentService', 'DepotService', '$timeout',
];

function CreateShipmentController(
  $state, Notify, Session, util,
  StockForm, Stock, uiGridConstants, Store, Barcode,
  Shipment, Depot, $timeout,
) {
  const vm = this;
  const existingShipmentUuid = $state.params.uuid;
  vm.existingShipmentUuid = existingShipmentUuid;
  vm.isCreateState = $state.params.isCreateState;
  vm.shipmentForm = new StockForm('ShipmentForm');
  vm.shipment = {};
  vm.gridApi = {};
  vm.selectedLots = [];
  vm.selectableInventories = [];
  vm.currentInventories = [];
  vm.reset = reset;
  vm.overconsumption = [];

  vm.onDateChange = date => {
    vm.shipment.anticipated_delivery_date = date;
    if (date < new Date()) {
      vm.dateMessageWarning = true;
    }

    loadRequiredInventories(vm.depot, date);
  };

  vm.onChangeDepot = onChangeDepot;

  function onChangeDepot(depot) {
    vm.depot = depot;
    vm.shipment.origin_depot_uuid = vm.depot.uuid;
    return loadRequiredInventories(vm.depot);
  }

  vm.onSelectDestinationDepot = depot => {
    vm.shipment.destination_depot_uuid = depot.uuid;
  };

  // bind methods
  vm.maxLength = util.maxLength;
  vm.enterprise = Session.enterprise;
  vm.maxDate = new Date();

  vm.addItems = addItems;
  vm.removeItem = removeItem;
  vm.configureItem = configureItem;
  vm.submit = submit;
  vm.checkValidity = checkValidity;
  vm.onLotSelect = onLotSelect;
  vm.getLotByBarcode = getLotByBarcode;

  const gridFooterTemplate = `
    <div style="margin-left: 10px;">
      {{ grid.appScope.gridApi.core.getVisibleRows().length }}
      <span translate>STOCK.ROWS</span>
    </div>
  `;

  const gridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    enableColumnMenus : false,
    rowTemplate : 'modules/templates/grid/error.row.html',
    columnDefs : [
      {
        field : 'status',
        width : 25,
        displayName : '',
        cellTemplate : 'modules/stock/exit/templates/status.tmpl.html',
      }, {
        field : 'code',
        width : 120,
        displayName : 'INVENTORY.CODE',
        headerCellFilter : 'translate',
        cellTemplate : 'modules/stock/exit/templates/code.tmpl.html',
      }, {
        field : 'description',
        displayName : 'TABLE.COLUMNS.DESCRIPTION',
        headerCellFilter : 'translate',
        cellTemplate : 'modules/stock/exit/templates/description.tmpl.html',
      }, {
        field : 'lot',
        width : 250,
        displayName : 'TABLE.COLUMNS.LOT',
        headerCellFilter : 'translate',
        cellTemplate : 'modules/stock/exit/templates/lot.tmpl.html',
      }, {
        field : 'quantity',
        width : 150,
        displayName : 'TABLE.COLUMNS.QUANTITY',
        headerCellFilter : 'translate',
        cellTemplate : 'modules/stock/exit/templates/quantity.tmpl.html',
        aggregationType : uiGridConstants.aggregationTypes.sum,
      }, {
        field : 'unit_type',
        width : 75,
        displayName : 'TABLE.COLUMNS.UNIT',
        headerCellFilter : 'translate',
        cellTemplate : 'modules/stock/exit/templates/unit.tmpl.html',
      }, {
        field : 'available_lot',
        width : 150,
        displayName : 'TABLE.COLUMNS.AVAILABLE',
        headerCellFilter : 'translate',
        cellTemplate : 'modules/stock/exit/templates/available.tmpl.html',
      }, {
        field : 'condition',
        width : 150,
        displayName : 'SHIPMENT.CONDITION',
        headerCellFilter : 'translate',
        cellTemplate : 'modules/shipment/templates/condition.tmpl.html',
      },
      {
        displayName : '',
        field : 'actions',
        width : 25,
        cellTemplate : 'modules/stock/exit/templates/actions.tmpl.html',
      },
    ],
    data : vm.shipmentForm.store.data,

    // fastWatch to false is required for updating the grid correctly for
    // inventories loaded from an invoice for patient exit
    fastWatch : false,
    flatEntityAccess : true,
    showGridFooter : true,
    gridFooterTemplate,
    onRegisterApi,
  };

  // exposing the grid options to the view
  vm.gridOptions = gridOptions;

  // reset the form after submission or on clear
  function reset(form) {
    const _form = form;
    _form.$setPristine();
    _form.$setUntouched();
    vm.shipmentForm.store.clear();
    vm.selectedLots = [];
    vm.overconsumption = [];
  }

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  function setupStock() {
    vm.selectedLots = [];
    vm.inventoryNotAvailable = [];
    vm.shipmentForm.setup();
    vm.shipmentForm.store.clear();
  }

  // add items
  function addItems(n) {
    vm.shipmentForm.addItems(n);
    checkValidity();
  }

  // remove item
  function removeItem(item) {
    vm.shipmentForm.removeItem(item.id);

    // restore the inventory to the selectableInventories list
    // if there are no more copies.
    if (item.inventory) {
      const isInList = vm.selectableInventories.some(row => row.uuid === item.inventory.uuid);
      if (!isInList) { vm.selectableInventories.push(item.inventory); }
    }

    checkValidity();
    refreshSelectedLotsList();
  }

  // configure item
  function configureItem(item) {
    item._initialised = true;

    // get lots for this inventory item
    Stock.lots.read(null, {
      depot_uuid : vm.depot.uuid,
      inventory_uuid : item.inventory.inventory_uuid,
      includeEmptyLot : 0,
    })
      .then(lots => {
        item.lots = lots.filter(lot => !vm.selectedLots.includes(lot.uuid));
      })
      .catch(Notify.handleError);
  }

  function startup() {
    vm.loading = true;
    vm.hasError = false;

    // load the shipment for update
    loadShipment();
  }

  function loadRequiredInventories(depot, dateTo = new Date()) {
    vm.loading = true;

    return loadInventories(depot, dateTo)
      .then(() => loadCurrentInventories(depot, dateTo))
      .then(() => {
        vm.overconsumption = [];
        checkValidity();
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  function loadInventories(depot, dateTo = new Date()) {
    setupStock();

    return Stock.inventories.read(null, {
      depot_uuid : depot.uuid,
      dateTo,
      skipTags : true,
      is_expired : undefined,
    })
      .then(inventories => {
        vm.selectableInventories = inventories.filter(item => item.quantity > 0);
        vm.emptyStock = !vm.selectableInventories.length;
        vm.mapSelectableInventories = new Store({ identifier : 'inventory_uuid', data : vm.selectableInventories });
        checkValidity();
      });
  }

  function loadCurrentInventories(depot, dateTo = new Date()) {
    return Stock.lots.read(null, { depot_uuid : depot.uuid, dateTo, skipTags : true })
      .then(lots => {
        vm.currentInventories = lots.filter(item => item.quantity > 0);
      });
  }

  function onLotSelect(row) {
    if (!row.lot || !row.lot.uuid) { return; }

    checkValidity();
    refreshSelectedLotsList(row);
  }

  function getLotByBarcode() {
    Barcode.modal({ shouldSearch : false })
      .then(record => {
        if (record.uuid) {
          Stock.lots.read(null, {
            depot_uuid : vm.depot.uuid,
            label : record.uuid.toUpperCase(),
            includeEmptyLot : 0,
          })
            .then(lots => {
              if (lots.length <= 0) {
                Notify.danger('STOCK.LOT_NOT_FOUND', 20000);
                return;
              }
              if (lots.length > 1) {
                Notify.danger('STOCK.DUPLICATE_LOTS', 20000);
                return;
              }

              // The lot is unique, construct a new row for it
              const lot = lots[0];
              const inventory = vm.mapSelectableInventories.get(lot.inventory_uuid);
              if (inventory) {
                const row = vm.shipmentForm.addItems(1);
                row.inventory = inventory;
                row.inventory_uuid = lot.inventory_uuid;
                row.quantity = 1;
                row.lot = lot;
                configureItem(row);
                checkValidity();
                refreshSelectedLotsList(row);
              }
            });
        }
      });
  }

  // update the list of selected lots
  function refreshSelectedLotsList(row) {
    vm.selectedLots = vm.shipmentForm.store.data
      .filter(item => item.lot && item.lot.uuid)
      .map(item => item.lot.uuid);

    if (row.lots.length === 1 && row.lots[0].inventory_uuid === row.lot.inventory_uuid) {
      vm.selectableInventories = vm.selectableInventories
        .filter(item => item.inventory_uuid !== row.lot.inventory_uuid);
    }
  }

  // check validity
  function checkValidity() {
    const lotsExists = vm.shipmentForm.store.data.every(item => {
      return item.quantity > 0 && item.lot.uuid;
    });
    vm.validForSubmit = (lotsExists && vm.shipmentForm.store.data.length && !vm.loading);
  }

  function submit(form) {
    if (form.$invalid) { return null; }

    const checkOverconsumption = vm.shipmentForm.store.data;

    checkOverconsumption.forEach(stock => {
      stock.quantityAvailable = 0;

      vm.currentInventories.forEach(lot => {
        if (lot.uuid === stock.lot.uuid) {
          stock.quantityAvailable = lot.quantity;
        }
      });
    });

    vm.overconsumption = checkOverconsumption.filter(c => c.quantity > c.quantityAvailable);

    if (vm.overconsumption.length) {
      vm.overconsumption.forEach(item => {
        item.textI18n = {
          text : item.inventory.text,
          label : item.lot.label,
          quantityAvailable : item.quantityAvailable,
          quantity : item.quantity,
          unit_type : item.inventory.unit_type,
        };
      });

      Notify.danger('ERRORS.ER_PREVENT_NEGATIVE_QUANTITY_IN_EXIT_STOCK');
      vm.$loading = false;
      return 0;
    }

    if (vm.shipmentForm.hasDuplicatedLots()) {
      return Notify.danger('ERRORS.ER_DUPLICATED_LOT', 20000);
    }

    vm.$loading = true;
    vm.shipment = cleanShipment(vm.shipment);
    vm.shipment.lots = vm.shipmentForm.store.data.map(cleanShipmentItem);

    const promise = (vm.isCreateState)
      ? Shipment.create(vm.shipment)
      : Shipment.update(existingShipmentUuid, vm.shipment);

    return promise
      .then(() => {
        reset(form);
        const translateKey = (vm.isCreateState) ? 'SHIPMENT.CREATED' : 'SHIPMENT.UPDATED';
        Notify.success(translateKey);
        $state.go('shipments', null, { reload : true });
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.$loading = false;
      });
  }

  function cleanShipment(shipment) {
    return {
      origin_depot_uuid : shipment.origin_depot_uuid,
      destination_depot_uuid : shipment.destination_depot_uuid,
      shipper_id : shipment.shipper_id,
      name : shipment.name,
      description : shipment.description,
      note : shipment.note,
      anticipated_delivery_date : shipment.anticipated_delivery_date,
    };
  }

  function cleanShipmentItem(row) {
    return {
      lot_uuid : row.lot ? row.lot.uuid : null,
      quantity : row.quantity,
      condition_id : row.condition_id,
    };
  }

  function loadShipment() {
    if (!existingShipmentUuid) { return; }
    Shipment.readAll(existingShipmentUuid)
      .then(shipment => {
        vm.shipment = shipment;
        vm.shipment.anticipated_delivery_date = new Date(vm.shipment.anticipated_delivery_date);
        return Depot.read(vm.shipment.origin_depot_uuid);
      })
      .then(depot => {
        return onChangeDepot(depot);
      })
      .then(() => {
        const shipmentLots = vm.shipment.lots.map(lot => lot.lot_uuid);
        const lots = vm.currentInventories.filter(lot => shipmentLots.includes(lot.uuid));
        $timeout(() => {
          lots.map(lot => addGridRow(lot));
        }, 0);
      })
      .catch(Notify.handleError);
  }

  function addGridRow(lot) {
    const inventory = vm.mapSelectableInventories.get(lot.inventory_uuid);
    if (inventory) {
      const row = vm.shipmentForm.addItems(1);
      row.inventory = inventory;
      row.inventory_uuid = lot.inventory_uuid;
      row.lot = lot;
      row.quantity = getData(lot).quantity;
      row.condition_id = getData(lot).condition_id;
      configureItem(row);
      checkValidity();
      refreshSelectedLotsList(row);
    }
  }

  function getData(lot) {
    const [item] = vm.shipment.lots.filter(_lot => _lot.lot_uuid === lot.uuid);
    return {
      quantity : item ? item.quantity : 0,
      condition_id : item ? item.condition_id : null,
    };
  }

  startup();
}
