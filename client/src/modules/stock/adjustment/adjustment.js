angular.module('bhima.controllers')
  .controller('StockAdjustmentController', StockAdjustmentController);

// dependencies injections
StockAdjustmentController.$inject = [
  'DepotService', 'InventoryService', 'NotifyService', 'SessionService', 'util',
  'bhConstants', 'ReceiptModal', 'StockFormService', 'StockService',
  'StockModalService', 'uiGridConstants', 'appcache',
];

/**
 * @class StockAdjustmentController
 *
 * @description
 * This module exists to make sure that stock can be adjusted up and down as needed.
 */
function StockAdjustmentController(
  Depots, Inventory, Notify, Session, util, bhConstants, ReceiptModal, StockForm,
  Stock, StockModal, uiGridConstants, AppCache
) {
  const vm = this;

  // TODO - merge all stock caches together so that the same depot is shared across all stock modules
  const cache = new AppCache('StockCache');

  // global variables
  vm.Stock = new StockForm('StockAdjustment');
  vm.movement = {};

  vm.onDateChange = date => {
    vm.movement.date = date;
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
  vm.changeDepot = changeDepot;
  vm.handleAdjustmentOption = handleAdjustmentOption;

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
      cellTemplate : 'modules/stock/adjustment/templates/quantity.tmpl.html',
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

    { field : 'actions', width : 25, cellTemplate : 'modules/stock/exit/templates/actions.tmpl.html' },
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
  };

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

  function handleAdjustmentOption(value) {
    vm.adjustmentOption = value;
    if (vm.adjustmentOption === 'increase') {
      vm.adjustmentType = 'FORM.LABELS.INCREASE';
    } else if (vm.adjustmentOption === 'decrease') {
      vm.adjustmentType = 'FORM.LABELS.DECREASE';
    }
  }

  // configure item
  function configureItem(item) {
    item._initialised = true;
    // get lots
    Stock.lots.read(null, { depot_uuid : vm.depot.uuid, inventory_uuid : item.inventory.inventory_uuid })
      .then((lots) => {
        item.lots = lots;
      })
      .catch(Notify.handleError);
  }

  function setupStock(depot) {
    vm.Stock.setup();
    vm.Stock.store.clear();
    loadInventories(depot);
    checkValidity();
  }

  function startup() {
    vm.movement = {
      date : new Date(),
      entity : {},
    };

    // make sure that the depot is loaded if it doesn't exist at startup.
    if (cache.depotUuid) {
      // load depot from the cached uuid
      loadDepot(cache.depotUuid).then(setupStock);
    } else {
      // show the changeDepot modal
      changeDepot().then(setupStock);
    }
  }

  // ============================ Inventories ==========================
  function loadInventories(depot) {
    const depotUuid = depot && depot.uuid ? depot.uuid : cache.depotUuid;
    Stock.inventories.read(null, { depot_uuid : depotUuid })
      .then((inventories) => {
        vm.selectableInventories = angular.copy(inventories);
      })
      .catch(Notify.handleError);
  }

  // check validity
  function checkValidity() {
    const lotsExists = vm.Stock.store.data.every((item) => {
      return item.quantity > 0 && item.lot.uuid;
    });
    vm.validForSubmit = (lotsExists && vm.Stock.store.data.length);
  }

  // ================================= Submit ================================
  function submit() {
    let isExit;
    let fluxId;

    // check stock validity
    checkValidity();

    if (!vm.validForSubmit || !vm.adjustmentOption) { return 0; }

    if (vm.adjustmentOption === 'increase') {
      isExit = 0;
      fluxId = bhConstants.flux.FROM_ADJUSTMENT;
    } else if (vm.adjustmentOption === 'decrease') {
      isExit = 1;
      fluxId = bhConstants.flux.TO_ADJUSTMENT;
    }

    const movement = {
      depot_uuid : vm.depot.uuid,
      entity_uuid : vm.movement.entity.uuid,
      date : vm.movement.date,
      description : vm.movement.description,
      is_exit : isExit,
      flux_id : fluxId,
      user_id : Session.user.id,
    };

    const lots = vm.Stock.store.data.map((row) => {
      return {
        uuid : row.lot.uuid,
        quantity : row.quantity,
        unit_cost : row.lot.unit_cost,
      };
    });

    movement.lots = lots;

    return Stock.movements.create(movement)
      .then(document => {
        vm.Stock.store.clear();
        ReceiptModal.stockAdjustmentReceipt(document.uuid, fluxId);
      })
      .catch(Notify.handleError);
  }

  function changeDepot() {
    // if requirement is true the modal cannot be canceled
    const requirement = !cache.depotUuid;

    return Depots.openSelectionModal(vm.depot, requirement)
      .then((depot) => {
        vm.depot = depot;
        cache.depotUuid = depot.uuid;
        return depot;
      });
  }

  function loadDepot(uuid) {
    return Depots.read(uuid, { only_user : true })
      .then(depot => {
        vm.depot = depot;
        return depot;
      })
      .catch(Notify.handleError);
  }

  startup();
}
