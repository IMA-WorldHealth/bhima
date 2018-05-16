angular.module('bhima.controllers')
  .controller('StockExitController', StockExitController);

// dependencies injections
StockExitController.$inject = [
  'DepotService', 'InventoryService', 'NotifyService', 'SessionService', 'util',
  'bhConstants', 'ReceiptModal', 'StockItemService', 'StockFormService', 'StockService',
  'StockModalService', 'uiGridConstants', '$translate', 'appcache',
  'moment', 'GridExportService', 'Store',
];

/**
 * @class StockExitController
 *
 * @description
 * This controller is responsible to handle stock exit module.
 *
 * @todo Implement caching data feature
 */
function StockExitController(
  Depots, Inventory, Notify, Session, util, bhConstants, ReceiptModal, StockItem, StockForm, Stock,
  StockModal, uiGridConstants, $translate, AppCache, moment, GridExportService, Store
) {
  const vm = this;
  const cache = new AppCache('StockCache');

  vm.stockForm = new StockForm('StockExit');
  vm.movement = {};
  vm.gridApi = {};
  vm.reset = reset;

  vm.onDateChange = date => {
    vm.movement.date = date;
  };

  // bind methods
  vm.maxLength = util.maxLength;
  vm.enterprise = Session.enterprise;
  vm.maxDate = new Date();

  vm.addItems = addItems;
  vm.removeItem = removeItem;
  vm.configureItem = configureItem;
  vm.selectExitType = selectExitType;
  vm.submit = submit;
  vm.changeDepot = changeDepot;
  vm.checkValidity = checkValidity;

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
        field : 'unit_price',
        width : 150,
        displayName : 'TABLE.COLUMNS.UNIT_PRICE',
        headerCellFilter : 'translate',
        cellTemplate : 'modules/stock/exit/templates/price.tmpl.html',
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
        field : 'amount',
        width : 150,
        displayName : 'TABLE.COLUMNS.AMOUNT',
        headerCellFilter : 'translate',
        cellTemplate : 'modules/stock/exit/templates/amount.tmpl.html',
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
    exportation.exportToCsv('Stock_Exit_', formatExportColumns, formatExportRows);
  };

  // reset the form after submission or on clear
  function reset(form) {
    const _form = form || mapExit.form;
    const _date = vm.movement.date;
    vm.movement = { date : _date };
    _form.$setPristine();
    _form.$setUntouched();
    vm.stockForm.store.clear();
  }

  /**
   * @function formatExportColumns
   *
   * @description this function will be apply to grid columns as filter for getting new columns
   *
   * @param {array} columns - refer to the grid columns array
   * @return {array} - return an array of column object in this format : { displayName : ... }
   */
  function formatExportColumns(columns) {
    return (columns || [])
      .filter(col => col.displayName && col.displayName.length)
      .map(col => ({ displayName : $translate.instant(col.displayName), width : col.width }));
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
      const amount = row.inventory && row.inventory.unit_cost && row.quantity ?
        row.inventory.unit_cost * row.quantity : 0;
      const expiration = row.lot && row.lot.expiration_date ?
        moment(row.lot.expiration_date).format(bhConstants.dates.formatDB) : null;

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
  }

  function setupStock() {
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
  }

  // configure item
  function configureItem(item) {
    item._initialised = true;
    // get lots
    Stock.lots.read(null, {
      depot_uuid : vm.depot.uuid,
      inventory_uuid : item.inventory.inventory_uuid,
      includeEmptyLot : 0,
    })
      .then(lots => {
        item.lots = lots;
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

    // make sure that the depot is loaded if it doesn't exist at startup.
    if (cache.depotUuid) {
      Depots.read(cache.depotUuid, { only_user : true })
        .then(handleCachedDepot)
        .catch(Notify.handleError);
    } else {
      changeDepot()
        .then(setupStock)
        .then(handleNotCachedDepot);
    }

    function handleCachedDepot(depot) {
      vm.depot = depot;
      setupStock();
      loadInventories(vm.depot);
      checkValidity();
    }

    function handleNotCachedDepot() {
      loadInventories(vm.depot);
      checkValidity();
    }
  }

  function loadInventories(depot) {
    setupStock();

    Stock.inventories.read(null, { depot_uuid : depot.uuid })
      .then(inventories => {
        vm.loading = false;
        vm.selectableInventories = angular.copy(inventories);

        // map of inventories by inventory uuid
        vm.mapSelectableInventories = new Store({ identifier : 'inventory_uuid', data : vm.selectableInventories });

        checkValidity();
      })
      .catch(Notify.handleError);
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
  }

  function resetSelectedEntity() {
    vm.movement.entity = {};
    vm.movement.exit_type = null;
    vm.movement.description = null;
    vm.reference = null;
    vm.displayName = null;
    vm.inventoryNotAvailable = [];
  }

  function submit(form) {
    if (form.$invalid) { return null; }

    if (!vm.movement.entity.uuid && vm.movement.entity.type !== 'loss') {
      return Notify.danger('ERRORS.ER_NO_STOCK_DESTINATION');
    }
    return mapExit[vm.movement.exit_type].submit()
      .then(() => {
        vm.validForSubmit = false;

        // reseting the form
        resetSelectedEntity();
        vm.reset(form);
      })
      .catch(Notify.handleError);
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

  // submit patient
  function submitPatient() {
    const invoiceUuid = vm.movement.entity.instance.invoice && vm.movement.entity.instance.invoice ?
      vm.movement.entity.instance.invoice.details.uuid : null;

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

    return Stock.movements.create(movement)
      .then(document => {
        vm.stockForm.store.clear();
        ReceiptModal.stockExitPatientReceipt(document.uuid, bhConstants.flux.TO_PATIENT);
      })
      .catch(Notify.handleError);
  }

  // submit service
  function submitService() {
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

    return Stock.movements.create(movement)
      .then(document => {
        vm.stockForm.store.clear();
        ReceiptModal.stockExitServiceReceipt(document.uuid, bhConstants.flux.TO_SERVICE);
      })
      .catch(Notify.handleError);
  }

  // submit depot
  function submitDepot() {
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
        vm.stockForm.store.clear();
        ReceiptModal.stockExitDepotReceipt(document.uuid, bhConstants.flux.TO_OTHER_DEPOT);
      })
      .catch(Notify.handleError);
  }

  // submit loss
  function submitLoss() {
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
        vm.stockForm.store.clear();
        ReceiptModal.stockExitLossReceipt(document.uuid, bhConstants.flux.TO_LOSS);
      })
      .catch(Notify.handleError);
  }

  function changeDepot() {
    // if requirement is true the modal cannot be canceled
    const requirement = !cache.depotUuid;

    return Depots.openSelectionModal(vm.depot, requirement)
      .then(depot => {
        vm.depot = depot;
        cache.depotUuid = vm.depot.uuid;
        loadInventories(vm.depot);
      });
  }

  startup();
}
