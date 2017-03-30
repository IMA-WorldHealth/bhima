angular.module('bhima.controllers')
.controller('StockExitController', StockExitController);

// dependencies injections
StockExitController.$inject = [
  'DepotService', 'InventoryService', 'NotifyService',
  'SessionService', 'util', 'bhConstants', 'ReceiptModal',
  'StockFormService', 'StockService', 'StockModalService',
  'uiGridGroupingConstants', '$translate',
];

/**
 * StockExitController
 * @description This controller is responsible to handle stock exit module
 * @todo Implement caching data feature
 */
function StockExitController(Depots, Inventory, Notify,
  Session, util, bhConstants, ReceiptModal,
  StockForm, Stock, StockModal,
  uiGridGroupingConstants, $translate) {
  var vm = this;
  var mapExit = {
    patient : { description: 'STOCK.EXIT_PATIENT', find: findPatient, submit: submitPatient },
    service : { description: 'STOCK.EXIT_SERVICE', find: findService, submit: submitService },
    depot   : { description: 'STOCK.EXIT_DEPOT', find: findDepot, submit: submitDepot },
    loss    : { description: 'STOCK.EXIT_LOSS', find: configureLoss, submit: submitLoss },
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

      { field               : 'unit_type',
        width               : 75,
        displayName         : 'TABLE.COLUMNS.UNIT',
        headerCellFilter    : 'translate',
        cellTemplate        : 'partials/stock/exit/templates/unit.tmpl.html' },

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
    data : vm.Stock.store.data,
  };

  vm.gridOptions = gridOptions;
  vm.checkValidity = checkValidity;

  // expose the API so that scrolling methods can be used
  function onRegisterApi(api) {
    vm.gridApi = api;
  }

  // exit type
  function selectExitType(exitType) {
    vm.movement.exit_type = exitType;
    mapExit[exitType].find();
    // FIXME: textarea default value must be translated in the view
    vm.movement.description = $translate.instant(mapExit[exitType].description);
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
      .catch(Notify.errorHandler);
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
      .catch(Notify.errorHandler);
  }

  // check validity
  function checkValidity() {
    var lotsExists = vm.Stock.store.data.every(function (item) {
      return item.quantity > 0 && item.lot.uuid;
    });
    vm.validForSubmit = (lotsExists && vm.Stock.store.data.length);
  }

  // ============================ Modals ================================
  // find patient
  function findPatient() {
    StockModal.openFindPatient()
    .then(function (patient) {
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
    .then(function (service) {
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
    StockModal.openFindDepot({ depot: vm.depot })
    .then(function (depot) {
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
    if (form.$invalid) { return; }
    mapExit[vm.movement.exit_type].submit()
      .then(function () {
        vm.validForSubmit = false;
      })
      .catch(Notify.errorHandler);
  }

  // submit patient
  function submitPatient() {
    var movement = {
      depot_uuid  : vm.depot.uuid,
      entity_uuid : vm.movement.entity.uuid,
      date        : vm.movement.date,
      description : vm.movement.description,
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

    return Stock.movements.create(movement)
    .then(function (document) {
      vm.Stock.store.clear();
      ReceiptModal.stockExitPatientReceipt(document.uuid, bhConstants.flux.TO_PATIENT);
    })
    .catch(Notify.errorHandler);
  }

  // submit service
  function submitService() {
    var movement = {
      depot_uuid  : vm.depot.uuid,
      entity_uuid : vm.movement.entity.uuid,
      date        : vm.movement.date,
      description : vm.movement.description,
      is_exit     : 1,
      flux_id     : bhConstants.flux.TO_SERVICE,
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
      ReceiptModal.stockExitServiceReceipt(document.uuid, bhConstants.flux.TO_SERVICE);
    })
    .catch(Notify.errorHandler);
  }

  // submit depot
  function submitDepot() {
    var movement = {
      from_depot  : vm.depot.uuid,
      to_depot    : vm.movement.entity.uuid,
      date        : vm.movement.date,
      description : vm.movement.description,
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
      ReceiptModal.stockExitDepotReceipt(document.uuid, bhConstants.flux.TO_OTHER_DEPOT);
    })
    .catch(Notify.errorHandler);
  }

  // submit loss
  function submitLoss() {
    var movement = {
      depot_uuid  : vm.depot.uuid,
      entity_uuid : vm.movement.entity.uuid,
      date        : vm.movement.date,
      description : vm.movement.description,
      is_exit     : 1,
      flux_id     : bhConstants.flux.TO_LOSS,
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
      ReceiptModal.stockExitLossReceipt(document.uuid, bhConstants.flux.TO_LOSS);
    })
    .catch(Notify.errorHandler);
  }

  moduleInit();
}
