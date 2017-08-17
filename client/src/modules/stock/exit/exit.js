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
function StockExitController(Depots, Inventory, Notify, Session, util, bhConstants, ReceiptModal, StockForm, Stock, StockModal, uiGridGroupingConstants, $translate) {
  var vm = this;
  var mapExit = {
    patient: { description: 'STOCK.EXIT_PATIENT', find: findPatient, submit: submitPatient },
    service: { description: 'STOCK.EXIT_SERVICE', find: findService, submit: submitService },
    depot: { description: 'STOCK.EXIT_DEPOT', find: findDepot, submit: submitDepot },
    loss: { description: 'STOCK.EXIT_LOSS', find: configureLoss, submit: submitLoss },
  };

  vm.util = util;
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
    appScopeProvider: vm,
    enableSorting: false,
    enableColumnMenus: false,
    columnDefs: [
      {
        field: 'status',
        width: 25,
        displayName: '',
        cellTemplate: 'modules/stock/exit/templates/status.tmpl.html'
      },

      {
        field: 'code',
        width: 120,
        displayName: 'INVENTORY.CODE',
        headerCellFilter: 'translate',
        cellTemplate: 'modules/stock/exit/templates/code.tmpl.html'
      },

      {
        field: 'description',
        displayName: 'TABLE.COLUMNS.DESCRIPTION',
        headerCellFilter: 'translate',
        cellTemplate: 'modules/stock/exit/templates/description.tmpl.html'
      },

      {
        field: 'lot',
        width: 150,
        displayName: 'TABLE.COLUMNS.LOT',
        headerCellFilter: 'translate',
        cellTemplate: 'modules/stock/exit/templates/lot.tmpl.html'
      },

      {
        field: 'unit_price',
        width: 150,
        displayName: 'TABLE.COLUMNS.UNIT_PRICE',
        headerCellFilter: 'translate',
        cellTemplate: 'modules/stock/exit/templates/price.tmpl.html'
      },

      {
        field: 'quantity',
        width: 150,
        displayName: 'TABLE.COLUMNS.QUANTITY',
        headerCellFilter: 'translate',
        cellTemplate: 'modules/stock/exit/templates/quantity.tmpl.html',
        treeAggregationType: uiGridGroupingConstants.aggregation.SUM
      },

      {
        field: 'unit_type',
        width: 75,
        displayName: 'TABLE.COLUMNS.UNIT',
        headerCellFilter: 'translate',
        cellTemplate: 'modules/stock/exit/templates/unit.tmpl.html'
      },

      {
        field: 'available_lot',
        width: 150,
        displayName: 'TABLE.COLUMNS.AVAILABLE',
        headerCellFilter: 'translate',
        cellTemplate: 'modules/stock/exit/templates/available.tmpl.html'
      },

      {
        field: 'amount',
        width: 150,
        displayName: 'TABLE.COLUMNS.AMOUNT',
        headerCellFilter: 'translate',
        cellTemplate: 'modules/stock/exit/templates/amount.tmpl.html'
      },

      {
        field: 'expiration_date',
        width: 150,
        displayName: 'TABLE.COLUMNS.EXPIRE_IN',
        headerCellFilter: 'translate',
        cellTemplate: 'modules/stock/exit/templates/expiration.tmpl.html'
      },

      { field: 'actions', width: 25, cellTemplate: 'modules/stock/exit/templates/actions.tmpl.html' },
    ],
    onRegisterApi: onRegisterApi,
    data: vm.Stock.store.data,
    fastWatch: true,
    flatEntityAccess: true,
  };

  vm.gridOptions = gridOptions;
  vm.checkValidity = checkValidity;

  // expose the API so that scrolling methods can be used
  function onRegisterApi(api) {
    vm.gridApi = api;
  }

  // exit type
  function selectExitType(exitType) {
    vm.movement.exit_type = exitType.label;
    mapExit[exitType.label].find();
    // FIXME: textarea default value must be translated in the view
    vm.movement.description = $translate.instant(mapExit[exitType.label].description);
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
    Stock.lots.read(null, { depot_uuid: vm.depot.uuid, inventory_uuid: item.inventory.inventory_uuid, includeEmptyLot : 0 })
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
          uuid: patient.uuid,
          type: 'patient',
          instance: patient,
        };

        setSelectedEntity(patient);
      })
      .catch(Notify.handleError);
  }

  // find service
  function findService() {
    StockModal.openFindService()
      .then(function (service) {
        if (!service) { return; }
        vm.movement.entity = {
          uuid: service.uuid,
          type: 'service',
          instance: service,
        };

        setSelectedEntity(service);
      })
      .catch(Notify.handleError);
  }

  // find depot
  function findDepot() {
    StockModal.openFindDepot({ depot: vm.depot })
      .then(function (depot) {
        if (!depot) { return; }
        vm.movement.entity = {
          uuid: depot.uuid,
          type: 'depot',
          instance: depot,
        };

        setSelectedEntity(depot);
      })
      .catch(Notify.handleError);
  }

  // configure loss
  function configureLoss() {
    vm.movement.entity = {
      uuid: null,
      type: 'loss',
      instance: {},
    };

    setSelectedEntity();
  }

  function setSelectedEntity (entity){
    var uniformEntity = Stock.uniformSelectedEntity(entity);
    vm.reference = uniformEntity.reference;
    vm.displayName = uniformEntity.displayName;
  }  

  // ================================ submit ================================
  function submit(form) {
    if (form.$invalid) { return; }
    mapExit[vm.movement.exit_type].submit()
      .then(function () {
        vm.validForSubmit = false;
      })
      .catch(Notify.handleError);
  }

  // submit patient
  function submitPatient() {
    var movement = {
      depot_uuid: vm.depot.uuid,
      entity_uuid: vm.movement.entity.uuid,
      date: vm.movement.date,
      description: vm.movement.description,
      is_exit: 1,
      flux_id: bhConstants.flux.TO_PATIENT,
      user_id: Session.user.id,
    };

    var lots = vm.Stock.store.data.map(function (row) {
      return {
        inventory_uuid: row.inventory.inventory_uuid, // needed for tracking consumption
        uuid: row.lot.uuid,
        quantity: row.quantity,
        unit_cost: row.lot.unit_cost,
      };
    });

    movement.lots = lots;

    return Stock.movements.create(movement)
      .then(function (document) {
        vm.Stock.store.clear();
        ReceiptModal.stockExitPatientReceipt(document.uuid, bhConstants.flux.TO_PATIENT);
      })
      .catch(Notify.handleError);
  }

  // submit service
  function submitService() {
    var movement = {
      depot_uuid: vm.depot.uuid,
      entity_uuid: vm.movement.entity.uuid,
      date: vm.movement.date,
      description: vm.movement.description,
      is_exit: 1,
      flux_id: bhConstants.flux.TO_SERVICE,
      user_id: Session.user.id,
    };

    var lots = vm.Stock.store.data.map(function (row) {
      return {
        inventory_uuid: row.inventory.inventory_uuid, // needed for tracking consumption
        uuid: row.lot.uuid,
        quantity: row.quantity,
        unit_cost: row.lot.unit_cost,
      };
    });

    movement.lots = lots;

    return Stock.movements.create(movement)
      .then(function (document) {
        vm.Stock.store.clear();
        ReceiptModal.stockExitServiceReceipt(document.uuid, bhConstants.flux.TO_SERVICE);
      })
      .catch(Notify.handleError);
  }

  // submit depot
  function submitDepot() {
    var movement = {
      from_depot: vm.depot.uuid,
      from_depot_is_warehouse: vm.depot.is_warehouse,
      to_depot: vm.movement.entity.uuid,
      date: vm.movement.date,
      description: vm.movement.description,
      isExit: true,
      user_id: Session.user.id,
    };

    var lots = vm.Stock.store.data.map(function (row) {
      return {
        inventory_uuid: row.inventory.inventory_uuid, // needed for tracking consumption
        uuid: row.lot.uuid,
        quantity: row.quantity,
        unit_cost: row.lot.unit_cost,
      };
    });

    movement.lots = lots;

    return Stock.movements.create(movement)
      .then(function (document) {
        vm.Stock.store.clear();
        ReceiptModal.stockExitDepotReceipt(document.uuid, bhConstants.flux.TO_OTHER_DEPOT);
      })
      .catch(Notify.handleError);
  }

  // submit loss
  function submitLoss() {
    var movement = {
      depot_uuid: vm.depot.uuid,
      entity_uuid: vm.movement.entity.uuid,
      date: vm.movement.date,
      description: vm.movement.description,
      is_exit: 1,
      flux_id: bhConstants.flux.TO_LOSS,
      user_id: Session.user.id,
    };

    var lots = vm.Stock.store.data.map(function (row) {
      return {
        inventory_uuid: row.inventory.inventory_uuid, // needed for tracking consumption
        uuid: row.lot.uuid,
        quantity: row.quantity,
        unit_cost: row.lot.unit_cost,
      };
    });

    movement.lots = lots;

    return Stock.movements.create(movement)
      .then(function (document) {
        vm.Stock.store.clear();
        ReceiptModal.stockExitLossReceipt(document.uuid, bhConstants.flux.TO_LOSS);
      })
      .catch(Notify.handleError);
  }

  moduleInit();
}
