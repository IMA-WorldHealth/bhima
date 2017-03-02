angular.module('bhima.controllers')
.controller('StockExitController', StockExitController);

// dependencies injections
StockExitController.$inject = [
  'DepotService', 'InventoryService', 'NotifyService',
  'SessionService', 'util', 'bhConstants',
  'StockFormService', 'StockService', 'StockModalService', 'uiGridGroupingConstants',
];

/**
 * StockExitController
 * @description This controller is responsible to handle stock exit module
 * @todo Implement caching data feature
 */
function StockExitController(Depots, Inventory, Notify,
  Session, util, bhConstants, StockForm, Stock, StockModal, uiGridGroupingConstants) {
  var vm = this;
  var mapExit = {
    patient : { find: findPatient, submit: submitPatient },
    service : { find: findService },
    depot   : { find: findDepot },
    loss    : { find: configureLoss },
  };

  vm.Stock = new StockForm('StockExit');
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
  vm.selectExitType = selectExitType;
  vm.setupDepot = setupDepot;
  vm.submit = submit;

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

      { field               : 'quantity',
        width               : 150,
        displayName         : 'TABLE.COLUMNS.QUANTITY',
        headerCellFilter    : 'translate',
        cellTemplate        : 'partials/stock/exit/templates/quantity.tmpl.html',
        treeAggregationType : uiGridGroupingConstants.aggregation.SUM },

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
    onRegisterApi,
    data : vm.Stock.store.data,
  };

  vm.gridOptions = gridOptions;

  // expose the API so that scrolling methods can be used
  function onRegisterApi(api) {
    vm.gridApi = api;
  }

  // exit type
  function selectExitType(exitType) {
    vm.movement.exit_type = exitType;
    mapExit[exitType].find();
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
  }

  // remove item
  function removeItem(item) {
    vm.Stock.removeItem(item.index);
    pushInventory(item.inventory);
  }

  // configure item
  function configureItem(item) {
    item._initialised = true;
    // get lots
    Stock.lots.read(null, { depot_uuid: vm.depot.uuid, inventory_uuid: item.inventory.inventory_uuid })
      .then((lots) => {
        item.lots = lots;
        popInventory(item);
      })
      .catch(Notify.errorHandler);
  }

  // init actions
  function moduleInit() {
    vm.movement = { date: new Date(), entity: {} };
    loadInventories(vm.depot);
    setupDepot(vm.depot);
  }

  // ============================ Inventories ==========================
  function loadInventories(depot) {
    var givenDepot = depot || vm.depot;
    Stock.inventories.read(null, { depot_uuid: givenDepot.uuid })
      .then((inventories) => {
        vm.selectableInventories = angular.copy(inventories);
      })
      .catch(Notify.errorHandler);
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

  // ============================ Modals ================================
  // find patient
  function findPatient() {
    StockModal.openFindPatient()
    .then((patient) => {
      if (!patient) { return; }
      vm.movement.entity = {
        uuid     : patient.uuid,
        type     : 'patient',
        instance : patient,
      };
    })
    .catch(Notify.errorHandler);
  }

  // find service
  function findService() {
    StockModal.openFindService()
    .then((service) => {
      if (!service) { return; }
      vm.movement.entity = {
        uuid     : service.uuid,
        type     : 'service',
        instance : service,
      };
    })
    .catch(Notify.errorHandler);
  }

  // find depot
  function findDepot() {
    StockModal.openFindDepot()
    .then((depot) => {
      if (!depot) { return; }
      vm.movement.entity = {
        uuid     : depot.uuid,
        type     : 'depot',
        instance : depot,
      };
    })
    .catch(Notify.errorHandler);
  }

  // configure loss
  function configureLoss() {
    vm.movement.entity = {
      uuid     : null,
      type     : 'loss',
      instance : {},
    };
  }

  // ================================ submit ================================
  function submit(form) {
    mapExit[vm.movement.exit_type].submit();
  }

  // submit patient
  function submitPatient() {
    var movement = {
      depot_uuid  : vm.depot.uuid,
      entity_uuid : vm.movement.entity.uuid,
      date        : vm.movement.date,
      is_exit     : 1,
      flux_id     : bhConstants.flux.TO_PATIENT,
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

    Stock.movements.create(movement)
    .then(function () {
      Notify.success('STOCK.SUCCESS');
    })
    .catch(Notify.errorHandler);
  }

  moduleInit();
}
