angular.module('bhima.controllers')
.controller('StockAdjustmentController', StockAdjustmentController);

// dependencies injections
StockAdjustmentController.$inject = [
  'DepotService', 'InventoryService', 'NotifyService',
  'SessionService', 'util', 'bhConstants', 'ReceiptModal',
  'StockFormService', 'StockService', 'StockModalService',
  'uiGridGroupingConstants',
];

function StockAdjustmentController(Depots, Inventory, Notify,
  Session, util, bhConstants, ReceiptModal, StockForm, Stock, StockModal,
  uiGridGroupingConstants) {
  var vm = this;

  // global variables
  vm.Stock = new StockForm('StockAdjustment');
  vm.gridApi = {};
  vm.depot = {};
  vm.movement = {};

  // bind methods
  vm.itemIncrement = 1;
  vm.enterprise = Session.enterprise;
  vm.maxLength = util.maxLength;
  vm.addItems = addItems;
  vm.removeItem = removeItem;
  vm.maxDate = new Date();
  vm.configureItem = configureItem;
  vm.setupDepot = setupDepot;
  vm.checkValidity = checkValidity;
  vm.submit = submit;

  // grid columns
  var columns = [
    { field        : 'status',
      width        : 25,
      displayName  : '',
      cellTemplate : 'partials/stock/exit/templates/status.tmpl.html' },

    { field            : 'code',
      width            : 120,
      displayName      : 'TABLE.COLUMNS.CODE',
      headerCellFilter : 'translate',
      cellTemplate     : 'partials/stock/exit/templates/code.tmpl.html' },

    { field            : 'description',
      displayName      : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter : 'translate',
      cellTemplate     : 'partials/stock/exit/templates/description.tmpl.html' },

    { field            : 'lot',
      width            : 150,
      displayName      : 'TABLE.COLUMNS.LOT',
      headerCellFilter : 'translate',
      cellTemplate     : 'partials/stock/exit/templates/lot.tmpl.html' },

    { field               : 'quantity',
      width               : 150,
      displayName         : 'TABLE.COLUMNS.QUANTITY',
      headerCellFilter    : 'translate',
      cellTemplate        : 'partials/stock/adjustment/templates/quantity.tmpl.html',
      treeAggregationType : uiGridGroupingConstants.aggregation.SUM },

    { field            : 'available_lot',
      width            : 150,
      displayName      : 'TABLE.COLUMNS.AVAILABLE',
      headerCellFilter : 'translate',
      cellTemplate     : 'partials/stock/exit/templates/available.tmpl.html' },

    { field            : 'expiration_date',
      width            : 150,
      displayName      : 'TABLE.COLUMNS.EXPIRATION_DATE',
      headerCellFilter : 'translate',
      cellTemplate     : 'partials/stock/exit/templates/expiration.tmpl.html' },

      { field: 'actions', width: 25, cellTemplate: 'partials/stock/exit/templates/actions.tmpl.html' },
  ];

  // grid options
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableSorting     : false,
    enableColumnMenus : false,
    columnDefs        : columns,
    onRegisterApi     : onRegisterApi,
    data              : vm.Stock.store.data,
    fastWatch         : true,
    flatEntityAccess  : true,
  };

  // expose the API so that scrolling methods can be used
  function onRegisterApi(api) {
    vm.gridApi = api;
  }

  // configure depot
  function setupDepot(depot) {
    if (!depot || !depot.uuid) { return; }
    vm.depot = depot;
    loadInventories(vm.depot);
    vm.Stock.setup();
    vm.Stock.store.clear();
  }

  // add items
  function addItems(n) {
    vm.Stock.addItems(n);
    checkValidity();
  }

  // remove item
  function removeItem(item) {
    vm.Stock.removeItem(item.index);
    checkValidity();
  }

  // configure item
  function configureItem(item) {
    item._initialised = true;
    // get lots
    Stock.lots.read(null, { depot_uuid: vm.depot.uuid, inventory_uuid: item.inventory.inventory_uuid })
      .then(function (lots) {
        item.lots = lots;
      })
      .catch(Notify.handleError);
  }

  // init actions
  function moduleInit() {
    vm.movement = { date: new Date(), entity: {} };
    loadInventories(vm.depot);
    setupDepot(vm.depot);
    checkValidity();
  }

  // ============================ Inventories ==========================
  function loadInventories(depot) {
    var givenDepot = depot || vm.depot;
    Stock.inventories.read(null, { depot_uuid: givenDepot.uuid })
      .then(function (inventories) {
        vm.selectableInventories = angular.copy(inventories);
      })
      .catch(Notify.handleError);
  }

  // remove item from selectable inventories
  function popInventory(item) {
    var idx;
    if (!item) { return; }
    vm.selectableInventories.indexOf(item.inventory);
    vm.selectableInventories.splice(idx, 1);
  }

  // insert item into selectable inventories
  function pushInventory(inventory) {
    if (!inventory) { return; }
    vm.selectableInventories.push(inventory);
  }

  // check validity
  function checkValidity() {
    var lotsExists = vm.Stock.store.data.every(function (item) {
      return item.quantity > 0 && item.lot.uuid;
    });
    vm.validForSubmit = (lotsExists && vm.Stock.store.data.length);
  }

  // ================================= Submit ================================
  function submit(form) {
    var isExit;
    var fluxId;

    if (form.$invalid || !vm.adjustmentOption) { return; }

    if (vm.adjustmentOption === 'increase') {
      isExit = 0;
      fluxId = bhConstants.flux.FROM_ADJUSTMENT;
    } else if (vm.adjustmentOption === 'decrease') {
      isExit = 1;
      fluxId = bhConstants.flux.TO_ADJUSTMENT;
    }

    var movement = {
      depot_uuid  : vm.depot.uuid,
      entity_uuid : vm.movement.entity.uuid,
      date        : vm.movement.date,
      description : vm.movement.description,
      is_exit     : isExit,
      flux_id     : fluxId,
      user_id     : Session.user.id,
    };

    var lots = vm.Stock.store.data.map(function (row) {
      return {
        uuid      : row.lot.uuid,
        quantity  : row.quantity,
        unit_cost : row.lot.unit_cost,
      };
    });

    movement.lots = lots;

    return Stock.movements.create(movement)
    .then(function (document) {
      vm.Stock.store.clear();
      ReceiptModal.stockAdjustmentReceipt(document.uuid, fluxId);
    })
    .catch(Notify.handleError);
  }

  // ================================= Startup ===============================
  moduleInit();
}
