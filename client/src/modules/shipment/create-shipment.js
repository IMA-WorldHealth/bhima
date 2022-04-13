angular.module('bhima.controllers')
  .controller('CreateShipmentController', CreateShipmentController);

// dependencies injections
CreateShipmentController.$inject = [
  '$state', 'NotifyService', 'SessionService', 'util',
  'StockExitFormService', 'uiGridConstants', 'BarcodeService',
  'ShipmentService', 'DepotService', '$timeout', 'ShipmentModalService',
  'bhConstants',
];

function CreateShipmentController(
  $state, Notify, Session, util,
  StockForm, uiGridConstants, Barcode,
  Shipment, Depot, $timeout, ShipmentModal,
  bhConstants,
) {
  const vm = this;
  const existingShipmentUuid = $state.params.uuid;

  vm.existingShipmentUuid = existingShipmentUuid;
  vm.isCreateState = $state.params.isCreateState;

  vm.stockForm = new StockForm('ShipmentForm');
  vm.stockForm.setAllowExpired(false);
  vm.stockForm.setExitTypePredefined(true);

  const gridFooterTemplate = `
    <div style="margin-left: 10px;">
      {{ grid.appScope.gridApi.core.getVisibleRows().length }}
      <span translate>TABLE.AGGREGATES.ROWS</span>
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
        displayName : '',
        field : 'actions',
        width : 25,
        cellTemplate : 'modules/stock/exit/templates/actions.tmpl.html',
      },
    ],
    data : vm.stockForm.store.data,

    // fastWatch to false is required for updating the grid correctly for
    // inventories loaded from an invoice for patient exit
    fastWatch : false,
    flatEntityAccess : true,
    showGridFooter : true,
    gridFooterTemplate,
    onRegisterApi,
  };

  vm.gridOptions = gridOptions;
  vm.shipment = {};
  vm.gridApi = {};
  vm.ROW_ERROR_FLAG = bhConstants.grid.ROW_ERROR_FLAG;

  vm.maxLength = util.maxLength;
  vm.enterprise = Session.enterprise;
  vm.maxDate = new Date();
  vm.onChangeDepot = onChangeDepot;
  vm.getOverview = getOverview;
  vm.setReady = setReady;
  vm.submit = submit;

  vm.onSelectDestinationDepot = depot => {
    vm.shipment.destination_depot_uuid = depot.uuid;

    // define the exit type as depot for allowing
    // to block expired items in the validation
    $timeout(() => {
      vm.stockForm.setExitType('depot');
      vm.stockForm.setDepotDistribution(depot);
    }, 0);
  };

  vm.validateItems = () => {
    vm.stockForm.validate(true);
    vm.messages = vm.stockForm.messages();
  };

  vm.configureItem = function configureItem(row, lot) {
    vm.stockForm.configureItem(row, lot);
    vm.validateItems();
  };

  vm.addItems = function addItems(numItems) {
    vm.stockForm.addItems(numItems);
    vm.validateItems();
  };

  vm.removeItem = function removeItem(uuid) {
    vm.stockForm.removeItem(uuid);
    vm.validateItems();
  };

  vm.setDate = function setDate(date) {
    vm.shipment.anticipated_delivery_date = date;
    vm.stockForm.setDate(date);
    vm.validateItems();
  };

  vm.setLotFromDropdown = function setLotFromDropdown(row, lot) {
    vm.stockForm._pool.use(lot.lot_uuid);
    row.configure(lot);
    vm.stockForm.updateLotListings(row.inventory_uuid);
    vm.validateItems();
  };

  vm.getLotByBarcode = function getLotByBarcode() {
    Barcode.modal({ shouldSearch : false })
      .then(record => {
        if (record.uuid) {
          vm.stockForm.addLotByBarcode(record.uuid);
          vm.messages = vm.stockForm.messages();
        }
      });
  };

  vm.clear = function clear() {
    vm.stockForm.clear();
    // trigger on change depot behavior
    // for having exit type and updated quantity
    $timeout(() => {
      onChangeDepot(vm.depot);
    }, 0);
  };

  function onChangeDepot(depot) {
    // depot assignment
    vm.depot = depot;
    vm.stockForm.setDepot(depot);

    // set the shipment origin
    vm.shipment.origin_depot_uuid = vm.depot.uuid;

    // trick an exit type which is required
    vm.stockForm.setExitType('loss');
    vm.stockForm.setLossDistribution();

    // run validation
    vm.validateItems();

    // refresh quantity available
    return refreshQuantityAvailable(vm.depot);
  }

  function setReady(uuid) {
    return ShipmentModal.setReadyForShipmentModal(uuid)
      .then(res => {
        if (res) { $state.go('shipments'); }
      });
  }

  function getOverview(uuid) {
    return ShipmentModal.shipmentOverviewModal(uuid);
  }

  function reset(form) {
    const _form = form;
    _form.$setPristine();
    _form.$setUntouched();
    vm.stockForm.store.clear();
  }

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  function startup() {
    vm.loading = true;
    vm.hasError = false;

    vm.stockForm.setup();
    vm.validateItems();

    // load the shipment for update
    loadShipment();
  }

  function refreshQuantityAvailable(depot, dateTo = new Date()) {
    return fetchAffectedAssets()
      .then(assets => {
        vm.alreadyAffected = assets;

        vm.stockForm._pool.available.data.forEach(lot => {
          const affectedQuantity = getAffectedQuantity(lot.lot_uuid);
          lot._quantity_available -= affectedQuantity;
          if (lot._quantity_available === 0 && affectedQuantity !== 0) {
            vm.stockForm._pool.use(lot.lot_uuid);
          }
        });

        vm.validateItems();

        return Shipment.read(null, { depot_uuid : depot.uuid, dateTo, skipTags : true });
      })
      .then(list => {
        vm.existingShipments = list;
      });
  }

  function getAffectedQuantity(uuid) {
    const el = (vm.alreadyAffected || []).filter(item => item.lot_uuid === uuid);
    const quantity = el.reduce((prev, curr) => curr.quantity_sent + prev, 0);
    return el ? quantity : 0;
  }

  function errorLineHighlight(row) {
    const { ROW_ERROR_FLAG } = bhConstants.grid;
    // set and unset error flag for allowing to highlight again the row
    // when the user click again on the submit button
    row[ROW_ERROR_FLAG] = true;
    $timeout(() => { row[ROW_ERROR_FLAG] = false; }, 3000);
  }

  function submit(form) {

    if (form.$invalid) {
      vm.validateItems();

      // Prepend general form needs fixing message
      const formMsg = {
        type : 'warn',
        text : 'STOCK.MESSAGES.WARN_MAIN_FORM_ERRORS',
        keys : {},
      };
      vm.messages.unshift(formMsg);
      Notify.danger(formMsg.text, 5000);
      return null;
    }

    const isValidForSubmission = vm.stockForm.validate(true);

    // check if the lots in the form are valid
    if (isValidForSubmission === false) {

      let firstElement = true;

      vm.stockForm.store.data.forEach(row => {
        const hasErrors = row.errors().length > 0;
        if (hasErrors) {
          // flash the error highlight
          errorLineHighlight(row);

          // scroll to the first invalid item
          if (firstElement) {
            vm.gridApi.core.scrollTo(row);
            firstElement = false;
          }
        }
      });

      // flash the first error message to the user
      const [msg] = vm.stockForm.messages();
      Notify.danger(msg.text, 5000);

      return null;
    }

    vm.$loading = true;
    vm.shipment = cleanShipment(vm.shipment);
    vm.shipment.lots = vm.stockForm.store.data.map(cleanShipmentItem);

    const promise = !!(vm.isCreateState)
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
      name : shipment.name,
      description : shipment.description,
      note : shipment.note,
      anticipated_delivery_date : shipment.anticipated_delivery_date,
    };
  }

  function cleanShipmentItem(row) {
    return {
      lot_uuid : row.lot_uuid,
      quantity : row.quantity,
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
      .then(depot => onChangeDepot(depot))
      .then(() => vm.stockForm.setLotsFromLotList(vm.shipment.lots, 'lot_uuid'))
      .catch(Notify.handleError);
  }

  function fetchAffectedAssets() {
    const isEdit = !vm.isCreateState && existingShipmentUuid;
    return Shipment.getAffectedAssets({
      origin_depot_uuid : vm.depot.uuid,
      currently_at_depot : true,
      except_current_shipment : isEdit ? existingShipmentUuid : undefined,
    });
  }

  startup();
}
