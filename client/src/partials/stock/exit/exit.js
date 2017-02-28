angular.module('bhima.controllers')
.controller('StockExitController', StockExitController);

// dependencies injections
StockExitController.$inject = [
  'DepotService', 'InventoryService', 'NotifyService',
  'PurchaseOrderService', 'PurchaseOrderForm', 'SupplierService',
  'SessionService', 'util', 'ReceiptModal', 'bhConstants',
  'StockFormService', 'StockService', 'Store',
];

function StockExitController(Depots, Inventory, Notify,
  Purchases, PurchaseOrder, Suppliers,
  Session, util, Receipts, bhConstants, StockForm, Stock, Store) {
  var vm = this;

  vm.Stock = new StockForm('StockExit');

  vm.movement = {
    details : {},
    hasCacheAvailable : false,
  };

  vm.depot = {};

  vm.itemIncrement = 1;
  vm.enterprise = Session.enterprise;
  vm.maxLength = util.maxLength;
  vm.addItems = addItems;
  vm.removeItem = removeItem;
  vm.maxDate = new Date();
  vm.selectExitType = selectExitType;
  vm.configureItem = configureItem;

  // grid options
  var gridOptions = {
    appScopeProvider  : vm,
    enableSorting     : false,
    enableColumnMenus : false,
    columnDefs        : [
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

      { field            : 'unit_price',
        width            : 150,
        displayName      : 'TABLE.COLUMNS.UNIT_PRICE',
        headerCellFilter : 'translate',
        cellTemplate     : 'partials/stock/exit/templates/price.tmpl.html' },

      { field            : 'quantity',
        width            : 150,
        displayName      : 'TABLE.COLUMNS.QUANTITY',
        headerCellFilter : 'translate',
        cellTemplate     : 'partials/stock/exit/templates/quantity.tmpl.html' },

      { field            : 'available_lot',
        width            : 150,
        displayName      : 'TABLE.COLUMNS.AVAILABLE',
        headerCellFilter : 'translate',
        cellTemplate     : 'partials/stock/exit/templates/available.tmpl.html' },

      { field            : 'amount',
        width            : 150,
        displayName      : 'TABLE.COLUMNS.AMOUNT',
        headerCellFilter : 'translate',
        cellTemplate     : 'partials/stock/exit/templates/amount.tmpl.html' },

      { field            : 'expiration_date',
        width            : 150,
        displayName      : 'TABLE.COLUMNS.EXPIRATION_DATE',
        headerCellFilter : 'translate',
        cellTemplate     : 'partials/stock/exit/templates/expiration.tmpl.html' },

      { field: 'actions', width: 25, cellTemplate: 'partials/stock/exit/templates/actions.tmpl.html' },
    ],
    onRegisterApi : onRegisterApi,
    data          : vm.Stock.store.data,
  };

  // bind methods
  vm.gridOptions = gridOptions;
  vm.configureItem = configureItem;
  vm.setupDepot = setupDepot;

  // expose the API so that scrolling methods can be used
  function onRegisterApi(api) {
    vm.gridApi = api;
  }

  // exit type
  function selectExitType(exitType) {
    vm.movement.details.exit_type = exitType;
  }

  // configure depot
  function setupDepot(depot) {
    if (!depot || !depot.uuid) { return; }
    vm.depot = depot;
    vm.Stock.setup(vm.depot.uuid);
  }

  // add items
  function addItems(n) {
    vm.Stock.addItems(n);
  }

  // remove item
  function removeItem(index) {
    vm.Stock.removeItem(index);
  }

  // configure item
  function configureItem(item) {
    item._initialised = true;
    item.inventory_uuid = item.inventory.inventory_uuid;
    // get lots
    Stock.lots.read(null, { depot_uuid: vm.depot.uuid, inventory_uuid: item.inventory_uuid })
      .then(function (lots) {
        item.lots = lots;
      })
      .catch(Notify.errorHandler);
  }

  function moduleInit() {
    setupDepot(vm.depot);
  }

  // read cache data
  function readCache() {
    if (!vm.Stock.hasCacheAvailable()) { return; }
    vm.Stock.readCache();
  }

  // ============================ Inventories ==========================
  Stock.inventories.read(null, { depot_uuid: vm.depot.uuid })
  .then(function (inventories) {
    vm.inventories = inventories;
  })
  .catch(Notify.errorHandler);

  moduleInit();
}
