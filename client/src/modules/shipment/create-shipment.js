angular.module('bhima.controllers')
  .controller('CreateShipmentController', CreateShipmentController);

// dependencies injections
CreateShipmentController.$inject = [
  '$state', 'NotifyService', 'util', '$translate',
  'StockExitFormService', 'uiGridConstants', 'BarcodeService',
  'ShipmentService', 'DepotService', '$timeout', 'ShipmentModalService',
  'bhConstants',
];

function CreateShipmentController(
  $state, Notify, util, $translate,
  StockForm, uiGridConstants, Barcode,
  Shipment, Depot, $timeout, ShipmentModal,
  bhConstants,
) {
  const vm = this;

  const existingShipmentUuid = $state.params.uuid;

  vm.existingShipmentUuid = existingShipmentUuid;

  vm.isCreateState = $state.params.isCreateState;

  vm.totalQuantity = 0;
  vm.totalWeight = 0;

  vm.stockForm = new StockForm('ShipmentForm');
  vm.stockForm.setAllowExpired(false);
  vm.stockForm.setExitTypePredefined(true);
  vm.stockForm.setExitType('depot');

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
        cellTemplate : 'modules/shipment/templates/quantity.tmpl.html',
        footerCellClass : 'text-right',
        footerCellTemplate : `<div class="ui-grid-cell-contents" >
           ${$translate.instant('SHIPMENT.TOTAL_QUANTITY')}: {{ grid.appScope.totalQuantity }}
           </div>`,
      }, {
        field : 'unit_weight',
        width : 150,
        displayName : 'TABLE.COLUMNS.UNIT_WEIGHT',
        headerCellFilter : 'translate',
        cellTemplate : 'modules/shipment/templates/unit_weight.tmpl.html',
        footerCellClass : 'text-right',
        footerCellTemplate : `<div class="ui-grid-cell-contents" >
           ${$translate.instant('SHIPMENT.TOTAL_WEIGHT')}: {{ grid.appScope.totalWeight }}
           </div>'`,
      }, {
        field : 'unit_type',
        width : 75,
        displayName : 'TABLE.COLUMNS.UNIT',
        headerCellFilter : 'translate',
        cellTemplate : 'modules/stock/inventories/templates/unit.tmpl.html',
      }, {
        field : '_quantity_available',
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

    fastWatch : false,
    flatEntityAccess : true,
    showColumnFooter : true,
    showGridFooter : true,
    gridFooterTemplate,
    onRegisterApi,
  };

  vm.gridOptions = gridOptions;
  vm.shipment = {};
  vm.gridApi = {};
  vm.ROW_ERROR_FLAG = bhConstants.grid.ROW_ERROR_FLAG;

  vm.today = new Date();
  vm.onChangeDepot = onChangeDepot;
  vm.getOverview = getOverview;
  vm.setReady = setReady;
  vm.submit = submit;

  vm.onSelectDestinationDepot = depot => {
    vm.shipment.destination_depot_uuid = depot.uuid;
    vm.stockForm.setDepotDistribution(depot);
  };

  function updateTotals() {
    vm.totalQuantity = 0;
    vm.totalWeight = 0;
    vm.stockForm.store.data.forEach(row => {
      vm.totalQuantity += row.quantity || 0;
      vm.totalWeight += (row.quantity || 0) * (row.unit_weight || 0);
    });
  }

  vm.validateItems = () => {
    updateTotals();
    vm.stockForm.validate(true);
    vm.messages = vm.stockForm.messages();
  };

  vm.configureItem = function configureItem(row, lot) {
    if (lot.isAsset()) {
      // Override default quantity for assets
      lot.quantity = 1;
    }
    lot.unit_type = lot.unit; // We seem to handle this differently in different parts of BHIMA!
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
  };

  vm.setLotFromDropdown = function setLotFromDropdown(row, lot) {
    row._quantity_available = lot._quantity_available;
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

    vm.shipment.origin_depot_uuid = vm.depot.uuid;

    // When the user changes the origin depot, only delete/clear the
    // destination_depot_uuid if
    //   - We are creating a shipment, OR
    //   - We are editing a shipment and the new origin depot is the same
    //     as the previous destination depot
    if (vm.isCreateState || (vm.shipment.destination_depot.uuid === depot.uuid)) {
      delete vm.shipment.destination_depot_uuid;
    }

    // refresh quantity available
    return vm.stockForm.setDepot(depot)
      .then(() => {

        // trick an exit type which is required
        vm.stockForm.setExitType('loss');
        vm.stockForm.setLossDistribution();

        // run validation
        vm.validateItems();

        return refreshQuantityAvailable(vm.depot);
      });
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
    form.$setPristine();
    form.$setUntouched();
    vm.stockForm.store.clear();
  }

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  function startup() {
    vm.$loading = true;
    vm.hasError = false;
    vm.stockForm.setup();

    vm.stockForm.setExitType('depot');

    vm.validateItems();

    // load the shipment for update
    loadShipment();
  }

  function refreshQuantityAvailable(depot, dateTo = new Date()) {
    return fetchAllocatedAssets()
      .then(assets => {
        // NOTE: By "allocated" we mean allocated to previous shipments
        //       therefore unavailable for this shipment
        vm.alreadyAllocated = assets;

        // compute allocated quantites
        const allocatedQuantityMap = vm.alreadyAllocated.reduce((map, asset) => {
          const prev = (map[asset.lot_uuid] || 0);
          map[asset.lot_uuid] = asset.quantity_sent + prev;
          return map;
        }, {});

        // remove used items from the pool
        const usedItems = vm.stockForm._pool.available.data.filter(lot => {
          const allocatedQuantity = allocatedQuantityMap[lot.lot_uuid] || 0;

          if (allocatedQuantity) {
            lot._quantity_available -= allocatedQuantity;
          }

          return lot._quantity_available === 0 && allocatedQuantity > 0;
        });

        // remove the used items from the pool
        usedItems.forEach(lot => vm.stockForm._pool.use(lot.lot_uuid));

        vm.validateItems();

        return Shipment.read(null, { depot_uuid : depot.uuid, dateTo, skipTags : true });
      })
      .then(list => {
        vm.existingShipments = list;
      });
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

    vm.shipment.lots = vm.stockForm.store.data.map(row => ({
      lot_uuid : row.lot_uuid,
      quantity : row.quantity,
      unit_weight : row.unit_weight,
      unit_type : row.unit_type,
    }));

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
      transport_mode : shipment.transport_mode,
      receiver : shipment.receiver,
      anticipated_delivery_date : shipment.anticipated_delivery_date,
    };
  }

  // Re-add any data lost by StockExitForm
  // (This is necessary because StockExit does not know about unit_weight)
  function updateLotsData(lots) {
    vm.stockForm.store.data.forEach(row => {
      const lot = lots.find(lt => lt.lot_uuid === row.lot_uuid);
      row.unit_weight = lot.unit_weight;
      row.unit_type = lot.unit_type;
    });
  }

  // this function
  function loadShipment() {
    if (!existingShipmentUuid) {
      vm.$loading = false;
      return;
    }

    Shipment.readAll(existingShipmentUuid)
      .then(shipment => {
        vm.shipment = shipment;
        vm.shipment.anticipated_delivery_date = new Date(vm.shipment.anticipated_delivery_date);
        return Depot.read(vm.shipment.origin_depot_uuid);
      })
      .then(originDepot => {
        vm.depot = originDepot;
        return vm.stockForm.setDepot(originDepot);
      })
      .then(() => {
        return Depot.read(vm.shipment.destination_depot_uuid);
      })
      .then(destDepot => {
        delete vm.messages;
        vm.stockForm.setExitType('depot');
        vm.stockForm.setDepotDistribution(destDepot);
        vm.stockForm.setLotsFromShipmentList(vm.shipment.lots, 'lot_uuid');
        updateLotsData(vm.shipment.lots);
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.$loading = false;
      });
  }

  function fetchAllocatedAssets() {
    const isEdit = !vm.isCreateState && existingShipmentUuid;
    return Shipment.getAllocatedAssets({
      origin_depot_uuid : vm.depot.uuid,
      currently_at_depot : true,
      except_current_shipment : isEdit ? existingShipmentUuid : undefined,
    });
  }

  startup();
}
