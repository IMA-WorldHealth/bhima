angular.module('bhima.controllers')
  .controller('CreateShipmentController', CreateShipmentController);

// dependencies injections
CreateShipmentController.$inject = [
  '$state', 'NotifyService', '$translate',
  'StockExitFormService', 'GridGroupingService', 'uiGridConstants', 'BarcodeService', 'ShipmentContainerService',
  'ShipmentService', 'DepotService', '$timeout', 'ShipmentModalService',
  'bhConstants', 'uuid',
];

function CreateShipmentController(
  $state, Notify, $translate,
  StockForm, Grouping, uiGridConstants, Barcode, Containers,
  Shipment, Depot, $timeout, ShipmentModal,
  bhConstants, Uuid,
) {
  const { NOT_CREATED } = Containers;

  const vm = this;

  vm.depot = {};

  const existingShipmentUuid = $state.params.uuid;
  vm.existingShipmentUuid = existingShipmentUuid;
  vm.isCreateState = $state.params.isCreateState;

  vm.shipment = {};

  vm.containers = [];

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

  const gridColumns = [
    {
      field : 'container_label',
      width : 150,
      displayName : 'SHIPMENT.CONTAINER',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/shipment/templates/container.tmpl.html',
      visible : false,
    }, {
      field : '_selected',
      width : 25,
      headerCellTemplate : `
        <div style="text-align: center;"><i class="fa fa-check" style="margin: 0; vertical-align: bottom;"></i></div>`,
      cellTemplate : 'modules/shipment/templates/checkbox.tmpl.html',
      visible : false,
    }, {
      field : '_spacer',
      displayName : '',
      width : 10,
    }, {
      field : 'status',
      width : 25,
      displayName : '',
      cellTemplate : 'modules/stock/exit/templates/status.tmpl.html',
    }, {
      field : 'code',
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
      displayName : 'TABLE.COLUMNS.LOT',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/exit/templates/lot.tmpl.html',
    }, {
      field : 'quantity',
      width : 100,
      displayName : 'TABLE.COLUMNS.QUANTITY',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/shipment/templates/quantity.tmpl.html',
      footerCellClass : 'text-right',
      footerCellTemplate : `<div class="ui-grid-cell-contents" >
         ${$translate.instant('SHIPMENT.TOTAL_QUANTITY')}: {{ grid.appScope.totalQuantity }}
         </div>`,
    }, {
      field : 'unit_weight',
      width : 120,
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
  ];

  const gridOptions = {
    appScopeProvider  : vm,
    columnDefs        : gridColumns,
    enableColumnMenus : false,
    enableSorting     : false,
    fastWatch         : false,
    flatEntityAccess  : true,
    gridFooterTemplate,
    onRegisterApi,
    showColumnFooter  : true,
    showGridFooter    : true,

    data : vm.stockForm.store.data,
  };

  vm.gridOptions = gridOptions;

  // THIS FAILS, not sure why!
  // vm.grouping = new Grouping(vm.gridOptions, true, 'container_label', true, true);

  vm.gridApi = {};

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
    checkVisibility();
  }

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

    // If there are any containers, automatically assign new lots to the last container
    if (vm.containers.length) {
      const last = vm.containers[vm.containers.length - 1];
      lot.container_uuid = last.uuid;
    }

    lot.unit_type = lot.unit;
    // NOTE: We seem to handle the name of 'unit' differently in different parts of BHIMA!
    //       In some queries, we return it as 'unit'.  In others, 'unit_type'

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

  function checkVisibility() {
    // Hide the container columns if there are no containers.
    const flag = vm.containers.length > 0;
    ['container_label', '_selected', '_spacer'].forEach(colName => {
      const col = vm.gridOptions.columnDefs.find(c => c.field === colName);
      col.visible = flag;
    });
    vm.gridApi.grid.refresh();
  }

  vm.newContainer = function newContainer() {
    ShipmentModal.openEditContainerModal({ action : 'create' })
      .then((result) => {
        if (!result) { return; }

        // Edit container model does not actually create a container in the
        // database.   So we need to add a temporary uuid for internal use here.
        result.uuid = Uuid();
        result[NOT_CREATED] = true;

        vm.containers.push(result);
        // NOTE: We are saving the data for containers but not creating
        //       containers yet.  We will do that later once the shipment itself
        //       is created.  This will prevent having to delete containers if
        //       the shipment we are creating is abandoned.

        // If this is the first container, assign all items to it
        if (vm.containers.length === 1) {
          vm.stockForm.store.data.forEach(row => {
            row.container_uuid = result.uuid;
            row.container_label = result.label;
          });
        }
      })
      .catch(Notify.handleError)
      .finally(() => {
        checkVisibility();
      });

  };

  vm.editContainer = function editContainer(container) {
    ShipmentModal.openEditContainerModal({ action : 'edit', container })
      .then((result) => {
        if (!result) { return; }

        // Update the container in memory
        // (This updates the newly created containers that are only in memory
        //  AND it updates the existing containers in memory without reloading them)
        const oldCont = vm.containers.find(cont => cont.uuid === container.uuid);
        oldCont.label = result.label;
        oldCont.container_type_id = result.container_type_id;
        oldCont.container_type = result.container_type;
      })
      .catch(Notify.handleError);
  };

  vm.deleteContainer = function deleteContainer(container) {

    // First, delete references in the grid rows (shipping items)
    vm.stockForm.store.data.forEach(row => {
      if (row.container_uuid === container.uuid) {
        row.container_uuid = null;
        row.container_label = null;
      }
    });

    // Next, delete the container from the list of containers in memory
    vm.containers = vm.containers.filter(cont => cont.uuid !== container.uuid);

    // Finally, if the container exists, delete it from the database
    // (Note that this also deletes any shipment_item references to it)
    if (!container[NOT_CREATED]) {
      Containers.delete(container.uuid);
    }

    checkVisibility();
  };

  vm.assignShippingItems = function assignShippingItems(container) {
    vm.stockForm.store.data.forEach(row => {
      if (row._selected) {
        row.container_uuid = container.uuid;
        row.container_label = container.label;
        row._selected = 0;
      }
    });
  };

  vm.setContainerFromDropdown = function setContainerFromDropdown(row, container) {
    row.container_label = container.label;
  };

  vm.setLotFromDropdown = function setLotFromDropdown(row, lot) {
    row._quantity_available = lot._quantity_available;
    vm.stockForm._pool.use(lot.lot_uuid);
    row.configure(lot);
    vm.stockForm.updateLotListings(row.inventory_uuid);
    vm.validateItems();
  };

  vm.getLotByBarcode = function getLotByBarcode() {
    Barcode.modal({ shouldSearch : false, label : 'BARCODE.SCAN_LOT_BARCODE' })
      .then(record => {
        if (record.uuid) {
          vm.stockForm.addLotByBarcode(record.uuid);
          vm.messages = vm.stockForm.messages();
        }
      });
  };

  vm.clear = function clear() {
    vm.stockForm.clear();

    vm.shipment = {};
    vm.containers = [];

    // trigger on change depot behavior
    // for having exit type and updated quantity
    $timeout(() => {
      onChangeDepot(vm.depot);
    }, 0);

    checkVisibility();
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
      container_uuid : row.container_uuid,
    }));

    const promise = !!(vm.isCreateState)
      ? Shipment.create(vm.shipment)
      : Shipment.update(existingShipmentUuid, vm.shipment);

    return promise
      .then((res) => {
        vm.shipment.uuid = vm.isCreateState ? res.uuid : existingShipmentUuid;
        reset(form);
        return true;
      })
      .then(() => {
        const promises = [];
        // Create any new containers
        vm.containers.forEach((cont) => {
          if (cont[NOT_CREATED]) {
            const newContainer = { ...cont }; // clone
            newContainer.shipment_uuid = vm.shipment.uuid;
            delete newContainer[NOT_CREATED];
            promises.push(Containers.create(newContainer));
          }
        });
        return Promise.all(promises);
      })
      .then(() => {
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
  // (This is necessary because StockExit does not know about unit_weight, etc)
  function updateLotsData(lots) {
    vm.stockForm.store.data.forEach(row => {
      const lot = lots.find(lt => lt.lot_uuid === row.lot_uuid);
      row.unit_weight = lot.unit_weight;
      row.unit_type = lot.unit_type;
      row.container_uuid = lot.container_uuid;
      row.container_label = lot.container_label;
      row._selected = 0;
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
        return Containers.list(vm.shipment.uuid);
      })
      .then((containers) => {
        vm.containers = containers;
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
