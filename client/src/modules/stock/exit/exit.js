angular.module('bhima.controllers')
  .controller('StockExitController', StockExitController);

// dependencies injections
StockExitController.$inject = [
  'NotifyService', 'SessionService', 'util',
  'bhConstants', 'ReceiptModal', 'StockFormService', 'StockService',
  'StockModalService', 'uiGridConstants', '$translate',
  'moment', 'GridExportService', 'Store',
  'PatientService', 'PatientInvoiceService', 'ServiceService',
];

/**
 * @class StockExitController
 *
 * @description
 * This controller is responsible to handle stock exit module.
 */
function StockExitController(
  Notify, Session, util, bhConstants, ReceiptModal,
  StockForm, Stock, StockModal, uiGridConstants, $translate,
  moment, GridExportService, Store,
  PatientService, PatientInvoiceService, ServiceService,
) {
  const vm = this;

  vm.stockForm = new StockForm('StockExit');
  vm.movement = {};
  vm.gridApi = {};
  vm.selectedLots = [];
  vm.soldOutInventories = [];
  vm.reset = reset;
  vm.ROW_ERROR_FLAG = bhConstants.grid.ROW_ERROR_FLAG;

  vm.onDateChange = date => {
    vm.movement.date = date;
    if (vm.movement.date < new Date()) {
      vm.dateMessageWarning = true;
    }
    loadInventories(vm.depot, date);
    stockOut(date);
  };

  vm.onChangeDepot = depot => {
    vm.depot = depot;
    loadInventories(vm.depot);
    stockOut();
  };

  // bind methods
  vm.maxLength = util.maxLength;
  vm.enterprise = Session.enterprise;
  vm.maxDate = new Date();
  vm.resetEntryExitTypes = false;

  vm.addItems = addItems;
  vm.removeItem = removeItem;
  vm.configureItem = configureItem;
  vm.selectExitType = selectExitType;
  vm.submit = submit;
  vm.checkValidity = checkValidity;
  vm.onLotSelect = onLotSelect;

  const mapExit = {
    patient : { description : 'STOCK.EXIT_PATIENT', find : findPatient, submit : submitPatient },
    service : { description : 'STOCK.EXIT_SERVICE', find : findService, submit : submitService },
    depot : { description : 'STOCK.EXIT_DEPOT', find : findDepot, submit : submitDepot },
    loss : { description : 'STOCK.EXIT_LOSS', find : configureLoss, submit : submitLoss },
  };

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
        width : 150,
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
        field : 'expiration_date',
        width : 150,
        displayName : 'TABLE.COLUMNS.EXPIRE_IN',
        headerCellFilter : 'translate',
        cellTemplate : 'modules/stock/exit/templates/expiration.tmpl.html',
      },
      {
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

  // exposing the grid options to the view
  vm.gridOptions = gridOptions;

  const exportation = new GridExportService(vm.gridOptions);

  /**
   * @method exportGrid
   * @description export the content of the grid to csv.
   */
  vm.exportGrid = () => {
    exportation.exportToCsv('Stock_Exit_', exportation.defaultColumnFormatter, formatExportRows);
  };

  // reset the form after submission or on clear
  function reset(form) {
    const _form = form || mapExit.form;
    const _date = vm.movement.date;
    vm.movement = { date : _date };
    _form.$setPristine();
    _form.$setUntouched();
    vm.stockForm.store.clear();
    vm.resetEntryExitTypes = true;
  }

  /**
   * @function formatExportRows
   *
   * @description this function will be apply to grid columns as filter for getting new columns
   *
   * @param {array} rows - refer to the grid data array
   * @return {array} - return an array of array with value as an object in this format : { value : ... }
   */
  function formatExportRows(rows) {
    return (rows || []).map(row => {
      const code = row.inventory && row.inventory.code ? row.inventory.code : null;
      const description = row.inventory && row.inventory.text ? row.inventory.text : null;
      const lot = row.lot && row.lot.label ? row.lot.label : null;
      const price = row.inventory && row.inventory.unit_cost ? row.inventory.unit_cost : null;
      const quantity = row.quantity ? row.quantity : null;
      const type = row.quantity && row.inventory.unit_type ? row.inventory.unit_type : null;
      const available = row.inventory && row.inventory.quantity ? row.inventory.quantity : null;
      const amount = row.inventory && row.inventory.unit_cost && row.quantity
        ? row.inventory.unit_cost * row.quantity : 0;
      const expiration = row.lot && row.lot.expiration_date
        ? moment(row.lot.expiration_date).format(bhConstants.dates.formatDB) : null;

      return [code, description, lot, price, quantity, type, available, amount, expiration].map(value => ({ value }));
    });
  }

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  function selectExitType(exitType) {
    vm.movement.exit_type = exitType.label;
    mapExit[exitType.label].find();
    vm.movement.description = $translate.instant(mapExit[exitType.label].description);
    vm.stockForm.store.clear();
    vm.resetEntryExitTypes = false;
  }

  function setupStock() {
    vm.selectedLots = [];
    vm.inventoryNotAvailable = [];
    vm.stockForm.setup();
    vm.stockForm.store.clear();
  }

  // add items
  function addItems(n) {
    vm.stockForm.addItems(n);
    checkValidity();
  }

  // remove item
  function removeItem(item) {
    vm.stockForm.removeItem(item.id);
    checkValidity();
    refreshSelectedLotsList();
  }

  // configure item
  function configureItem(item) {
    item._initialised = true;
    // get lots
    Stock.lots.read(null, {
      depot_uuid : vm.depot.uuid,
      inventory_uuid : item.inventory.inventory_uuid,
      includeEmptyLot : 0,
      dateTo : vm.movement.date,
    })
      .then(lots => {
        item.lots = lots.filter(lot => !vm.selectedLots.includes(lot.uuid));
      })
      .catch(Notify.handleError);
  }

  function startup() {
    // setting params for grid loading state
    vm.loading = true;
    vm.hasError = false;

    vm.movement = {
      date : new Date(),
      entity : {},
    };
    stockOut();
  }

  function loadInventories(depot, dateTo = new Date()) {
    setupStock();

    Stock.inventories.read(null, { depot_uuid : depot.uuid, dateTo })
      .then(inventories => {
        vm.loading = false;
        vm.selectableInventories = inventories.filter(item => item.quantity > 0);

        // map of inventories by inventory uuid
        vm.mapSelectableInventories = new Store({ identifier : 'inventory_uuid', data : vm.selectableInventories });

        checkValidity();
      })
      .catch(Notify.handleError);
  }

  // on lot select
  function onLotSelect(row) {
    if (!row.lot || !row.lot.uuid) { return; }

    checkValidity();
    refreshSelectedLotsList();
  }

  // update the list of selected lots
  function refreshSelectedLotsList() {
    vm.selectedLots = vm.stockForm.store.data
      .filter(item => item.lot && item.lot.uuid)
      .map(item => item.lot.uuid);
  }

  // check validity
  function checkValidity() {
    const lotsExists = vm.stockForm.store.data.every(item => {
      return item.quantity > 0 && item.lot.uuid;
    });
    vm.validForSubmit = (lotsExists && vm.stockForm.store.data.length);
  }

  function handleSelectedEntity(_entity, _type) {
    if (!_entity || !_entity.uuid) {
      resetSelectedEntity();
      return;
    }

    vm.movement.entity = {
      uuid : _entity.uuid,
      type : _type,
      instance : _entity,
    };

    setSelectedEntity(_entity);
  }

  // find patient
  function findPatient() {
    StockModal.openFindPatient({ entity_uuid : vm.selectedEntityUuid })
      .then(patient => {
        handleSelectedEntity(patient, 'patient');
        loadInvoiceInventories(patient);
      })
      .catch(Notify.handleError);
  }

  // load inventories from an invoice
  function loadInvoiceInventories(patient) {
    if (!patient || !patient.invoice) { return; }

    vm.inventoryNotAvailable = [];
    vm.stockForm.clear();

    if (!patient.invoice.items.length) { return; }

    patient.invoice.items.forEach((item) => {
      const inventory = vm.mapSelectableInventories.get(item.inventory_uuid);

      if (inventory) {
        const row = vm.stockForm.addItems(1);

        row.inventory = inventory;
        row.inventory_uuid = item.inventory_uuid;
        row.quantity = item.quantity;
        row.lot = {};

        configureItem(row);
      } else {
        vm.inventoryNotAvailable.push(item.text);
      }
    });

    vm.checkValidity();
  }

  // find service
  function findService() {
    StockModal.openFindService({ entity_uuid : vm.selectedEntityUuid })
      .then(service => {
        handleSelectedEntity(service, 'service');
      })
      .catch(Notify.handleError);
  }

  // find depot
  function findDepot() {
    StockModal.openFindDepot({ depot : vm.depot, entity_uuid : vm.selectedEntityUuid })
      .then(depot => {
        handleSelectedEntity(depot, 'depot');
      })
      .catch(Notify.handleError);
  }

  // configure loss
  function configureLoss() {
    vm.movement.entity = {
      uuid : null,
      type : 'loss',
      instance : {},
    };

    setSelectedEntity();
  }

  function setSelectedEntity(entity) {
    const uniformEntity = Stock.uniformSelectedEntity(entity);
    vm.reference = uniformEntity.reference;
    vm.displayName = uniformEntity.displayName;
    vm.selectedEntityUuid = uniformEntity.uuid;
    vm.requisition = (entity && entity.requisition) || {};
    loadRequisitions(entity);
  }

  function loadRequisitions(entity) {
    if (entity.requisition && entity.requisition.items && entity.requisition.items.length) {
      setupStock();

      entity.requisition.items.forEach((item) => {
        const inventory = vm.mapSelectableInventories.get(item.inventory_uuid);

        if (inventory) {
          const row = vm.stockForm.addItems(1);

          row.inventory = inventory;
          row.inventory_uuid = item.inventory_uuid;
          row.quantity = item.quantity;
          row.lot = {};

          configureItem(row);
        } else {
          vm.inventoryNotAvailable.push(item.text);
        }
      });

      vm.checkValidity();
    }
  }

  function resetSelectedEntity() {
    vm.movement.entity = {};
    vm.movement.exit_type = null;
    vm.movement.description = null;
    vm.reference = null;
    vm.displayName = null;
    vm.inventoryNotAvailable = [];
    delete vm.selectedEntityUuid;
  }

  function submit(form) {
    if (form.$invalid) { return null; }

    if (!vm.movement.entity.uuid && vm.movement.entity.type !== 'loss') {
      return Notify.danger('ERRORS.ER_NO_STOCK_DESTINATION');
    }

    if (vm.stockForm.hasDuplicatedLots()) {
      return Notify.danger('ERRORS.ER_DUPLICATED_LOT', 20000);
    }

    vm.$loading = true;
    return mapExit[vm.movement.exit_type].submit(form)
      .then(toggleLoadingIndicator)
      .catch(Notify.handleError);
  }

  function toggleLoadingIndicator() {
    vm.$loading = !vm.$loading;
  }

  function reinit(form) {
    vm.reset(form);
    vm.selectedLots = [];
    resetSelectedEntity();
  }

  // handle lot function
  function formatLot(row) {
    return {
      inventory_uuid : row.inventory.inventory_uuid, // needed for tracking consumption
      uuid : row.lot.uuid,
      quantity : row.quantity,
      unit_cost : row.lot.unit_cost,
    };
  }

  function buildDescription(entityUuid, invoiceUuid) {
    const dbPromises = [
      PatientService.read(null, { uuid : entityUuid }),
      ServiceService.read(null, { uuid : entityUuid }),
      invoiceUuid ? PatientInvoiceService.read(null, { uuid : invoiceUuid }) : [],
    ];

    return Promise.all(dbPromises)
      .then(([patients, services, invoices]) => {
        const i18nKeys = { depot : vm.depot.text };

        if (patients && patients.length) {
          const patient = patients[0];
          i18nKeys.patient = patient.display_name.concat(` (${patient.reference})`);
        }

        if (invoices && invoices.length) {
          const invoice = invoices[0];
          i18nKeys.invoice = invoice.reference;
        }

        if (services && services.length) {
          const service = services[0];
          i18nKeys.service = service.name;
        }

        let description;

        if (vm.depot.text && i18nKeys.patient) {
          description = $translate.instant('STOCK.EXIT_PATIENT_ADVANCED', i18nKeys);
        }

        if (vm.depot.text && i18nKeys.patient && i18nKeys.invoice) {
          description = $translate.instant('STOCK.EXIT_PATIENT_ADVANCED_WITH_INVOICE', i18nKeys);
        }

        if (vm.depot.text && i18nKeys.service) {
          description = $translate.instant('STOCK.EXIT_SERVICE_ADVANCED', i18nKeys);
        }

        return description ? description.concat(' : ') : '';
      });
  }

  // submit patient
  function submitPatient(form) {
    const invoiceUuid = vm.movement.entity.instance.invoice && vm.movement.entity.instance.invoice
      ? vm.movement.entity.instance.invoice.details.uuid : null;

    const movement = {
      depot_uuid : vm.depot.uuid,
      entity_uuid : vm.movement.entity.uuid,
      invoice_uuid : invoiceUuid,
      date : vm.movement.date,
      description : vm.movement.description,
      is_exit : 1,
      flux_id : bhConstants.flux.TO_PATIENT,
      user_id : vm.stockForm.details.user_id,
    };

    const lots = vm.stockForm.store.data.map(formatLot);

    movement.lots = lots;

    return buildDescription(movement.entity_uuid, movement.invoice_uuid)
      .then(description => {
        movement.description = String(description).concat(vm.movement.description);
        return Stock.movements.create(movement);
      })
      .then(document => {
        ReceiptModal.stockExitPatientReceipt(document.uuid, bhConstants.flux.TO_PATIENT);
        reinit(form);
      })
      .catch(Notify.handleError);
  }

  // submit service
  function submitService(form) {
    let documentUuid;

    const movement = {
      depot_uuid : vm.depot.uuid,
      entity_uuid : vm.movement.entity.uuid,
      date : vm.movement.date,
      description : vm.movement.description,
      is_exit : 1,
      flux_id : bhConstants.flux.TO_SERVICE,
      user_id : vm.stockForm.details.user_id,
    };

    const lots = vm.stockForm.store.data.map(formatLot);

    movement.lots = lots;

    return buildDescription(movement.entity_uuid)
      .then(description => {
        movement.description = String(description).concat(vm.movement.description);
        return Stock.movements.create(movement);
      })
      .then(document => {
        documentUuid = document.uuid;

        // update requisition status if needed
        if (!vm.requisition) { return null; }

        const COMPLETED_STATUS = 2;
        return Stock.stockRequisition.update(vm.requisition.uuid, { status_id : COMPLETED_STATUS });
      })
      .then(() => {
        ReceiptModal.stockExitServiceReceipt(documentUuid, bhConstants.flux.TO_SERVICE);
        reinit(form);
      })
      .catch(Notify.handleError);
  }

  // submit depot
  function submitDepot(form) {
    let documentUuid;

    const movement = {
      from_depot : vm.depot.uuid,
      from_depot_is_warehouse : vm.depot.is_warehouse,
      to_depot : vm.movement.entity.uuid,
      date : vm.movement.date,
      description : vm.movement.description,
      isExit : true,
      user_id : vm.stockForm.details.user_id,
    };

    const lots = vm.stockForm.store.data.map(formatLot);

    movement.lots = lots;

    return Stock.movements.create(movement)
      .then(document => {
        documentUuid = document.uuid;

        // update requisition status if needed
        if (!vm.requisition) { return null; }

        const COMPLETED_STATUS = 2;
        return Stock.stockRequisition.update(vm.requisition.uuid, { status_id : COMPLETED_STATUS });
      })
      .then(() => {
        ReceiptModal.stockExitDepotReceipt(documentUuid, bhConstants.flux.TO_OTHER_DEPOT);
        reinit(form);
      })
      .catch(Notify.handleError);
  }

  // submit loss
  function submitLoss(form) {
    const movement = {
      depot_uuid : vm.depot.uuid,
      entity_uuid : vm.movement.entity.uuid,
      date : vm.movement.date,
      description : vm.movement.description,
      is_exit : 1,
      flux_id : bhConstants.flux.TO_LOSS,
      user_id : vm.stockForm.details.user_id,
    };

    const lots = vm.stockForm.store.data.map(formatLot);

    movement.lots = lots;

    return Stock.movements.create(movement)
      .then(document => {
        ReceiptModal.stockExitLossReceipt(document.uuid, bhConstants.flux.TO_LOSS);
        reinit(form);
      })
      .catch(Notify.handleError);
  }

  /**
   * @function stockOut
   * get stock out inventories for a depot
   */
  function stockOut(dateTo = new Date()) {
    if (!vm.depot) return;
    Stock.inventories.read(null, {
      status : 'stock_out',
      depot_uuid : vm.depot.uuid,
      dateTo,
    }).then(inventories => {
      inventories.forEach(inventory => {
        inventory.stock_out_date = moment(inventory.stock_out_date).fromNow();
      });
      vm.soldOutInventories = inventories;
    }).catch(Notify.handleError);
  }

  startup();
}
