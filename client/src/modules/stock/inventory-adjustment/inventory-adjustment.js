angular.module('bhima.controllers')
  .controller('StockInventoryAdjustmentController', StockInventoryAdjustmentController);

// dependencies injections
StockInventoryAdjustmentController.$inject = [
  'NotifyService', 'SessionService', 'util',
  'bhConstants', 'ReceiptModal', 'StockFormService', 'StockService',
  'uiGridConstants',
];

/**
 * @class StockInventoryAdjustmentController
 *
 * @description
 * This module exists to make sure that existing stock can be adjusted entirely
 */
function StockInventoryAdjustmentController(
  Notify, Session, util, bhConstants, ReceiptModal, StockForm,
  Stock, uiGridConstants,
) {
  const vm = this;

  // global variables
  vm.Stock = new StockForm('StockInventoryAdjustment');
  vm.movement = {};
  vm.ROW_ERROR_FLAG = bhConstants.grid.ROW_ERROR_FLAG;

  vm.onDateChange = date => {
    vm.movement.date = date;
  };

  vm.onChangeDepot = depot => {
    vm.depot = depot;
    loadInventories(vm.depot);
  };

  // bind constants
  vm.enterprise = Session.enterprise;
  vm.maxLength = util.maxLength;
  vm.maxDate = new Date();

  // bind methods
  vm.addItems = addItems;
  vm.removeItem = removeItem;
  vm.configureItem = configureItem;
  vm.checkValidity = checkValidity;
  vm.submit = submit;
  vm.selectedLots = [];
  vm.onLotSelect = onLotSelect;

  // grid columns
  const columns = [
    {
      field : 'status',
      width : 25,
      displayName : '',
      cellTemplate : 'modules/stock/exit/templates/status.tmpl.html',
    },

    {
      field : 'code',
      width : 120,
      displayName : 'TABLE.COLUMNS.CODE',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/exit/templates/code.tmpl.html',
    },

    {
      field : 'description',
      displayName : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/exit/templates/description.tmpl.html',
    },

    {
      field : 'lot',
      width : 150,
      displayName : 'TABLE.COLUMNS.LOT',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/exit/templates/lot.tmpl.html',
    },

    {
      field : 'quantity',
      width : 150,
      displayName : 'TABLE.COLUMNS.QUANTITY',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/inventory-adjustment/templates/quantity.tmpl.html',
      aggregationType : uiGridConstants.aggregationTypes.sum,
    },

    {
      field : 'available_lot',
      width : 150,
      displayName : 'TABLE.COLUMNS.AVAILABLE',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/exit/templates/available.tmpl.html',
    },

    {
      field : 'expiration_date',
      width : 150,
      displayName : 'TABLE.COLUMNS.EXPIRATION_DATE',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/exit/templates/expiration.tmpl.html',
    },

    {
      field : 'actions',
      displayName : '...',
      width : 25,
      cellTemplate : 'modules/stock/exit/templates/actions.tmpl.html',
    },
  ];

  // grid options
  vm.gridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    enableColumnMenus : false,
    columnDefs : columns,
    data : vm.Stock.store.data,
    fastWatch : true,
    flatEntityAccess : true,
    rowTemplate : 'modules/templates/grid/error.row.html',
  };

  // on lot select
  function onLotSelect(row) {
    if (!row.lot || !row.lot.uuid) { return; }

    checkValidity();
    refreshSelectedLotsList();
  }

  // update the list of selected lots
  function refreshSelectedLotsList() {
    vm.selectedLots = vm.Stock.store.data
      .filter(item => item.lot && item.lot.uuid)
      .map(item => item.lot.uuid);
  }

  // add items
  function addItems(n) {
    vm.Stock.addItems(n);
    checkValidity();
  }

  // remove item
  function removeItem(item) {
    vm.Stock.removeItem(item.id);
    checkValidity();
  }

  // configure item
  function configureItem(item) {
    item._initialised = true;
    // get lots
    Stock.lots.read(null, { depot_uuid : vm.depot.uuid, inventory_uuid : item.inventory.inventory_uuid })
      .then((lots) => {
        item.lots = lots.filter(lot => !vm.selectedLots.includes(lot.uuid));
      })
      .catch(Notify.handleError);
  }

  function setupStock() {
    vm.selectedLots = [];
    vm.Stock.setup();
    vm.Stock.store.clear();
  }

  function startup() {
    vm.movement = {
      date : new Date(),
      entity : {},
    };
  }

  // ============================ Inventories ==========================
  function loadInventories(depot) {
    setupStock();

    Stock.inventories.read(null, { depot_uuid : depot.uuid })
      .then((inventories) => {
        vm.selectableInventories = angular.copy(inventories);
        checkValidity();
      })
      .catch(Notify.handleError);
  }

  // check validity
  function checkValidity() {
    const lotsExists = vm.Stock.store.data.every((item) => {
      return item.quantity >= 0 && item.lot && item.lot.uuid;
    });

    vm.validForSubmit = (lotsExists && vm.Stock.store.data.length);
  }

  // ================================= Submit ================================
  function submit() {
    // check stock validity
    checkValidity();

    if (!vm.validForSubmit) { return 0; }

    if (vm.Stock.hasDuplicatedLots()) {
      return Notify.danger('ERRORS.ER_DUPLICATED_LOT', 20000);
    }

    const movement = {
      depot_uuid : vm.depot.uuid,
      date : vm.movement.date,
      description : vm.movement.description,
      is_exit : 0,
      flux_id : bhConstants.flux.INVENTORY_ADJUSTMENT,
      user_id : Session.user.id,
    };

    const lots = vm.Stock.store.data.map((row) => {
      const out = row.lot;
      out.quantity = row.quantity;
      return out;
    });

    movement.lots = lots;

    return Stock.inventoryAdjustment.create(movement)
      .then(document => {
        vm.Stock.store.clear();
        vm.selectedLots = [];
        ReceiptModal.stockAdjustmentReceipt(document.uuid, bhConstants.flux.INVENTORY_ADJUSTMENT);
      })
      .catch(Notify.handleError);
  }

  startup();
}
