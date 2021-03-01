angular.module('bhima.controllers')
  .controller('StockAdjustmentController', StockAdjustmentController);

// dependencies injections
StockAdjustmentController.$inject = [
  'NotifyService', 'SessionService', 'util',
  'bhConstants', 'ReceiptModal', 'StockFormService', 'StockService',
  'uiGridConstants', '$translate',
];

/**
 * @class StockAdjustmentController
 *
 * @description
 * This module exists to make sure that stock can be adjusted up and down as needed.
 */
function StockAdjustmentController(
  Notify, Session, util, bhConstants, ReceiptModal, StockForm,
  Stock, uiGridConstants, $translate,
) {
  const vm = this;

  // global variables
  vm.Stock = new StockForm('StockAdjustment');
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

    vm.Stock.store.data.forEach(item => {
      item.lots = getVisibleLots(item);
    });
  }

  /**
   * @function getVisibleLots
   *
   * @description
   * Only shows lots with positive quantities if the adjustment option is to decrease
   * the quantity in stock.
   */
  function getVisibleLots(item) {
    return item.lotsFull
      .filter(v => (vm.adjustmentOption === 'decrease' ? v.quantity > 0 : true));
  }

  // configure item
  function configureItem(item) {
    item._initialised = true;
    // get lots
    Stock.lots.read(null, { depot_uuid : vm.depot.uuid, inventory_uuid : item.inventory.inventory_uuid })
      .then((lots) => {
        item.lotsFull = lots;
        item.lots = getVisibleLots(item);
      })
      .catch(Notify.handleError);
  }

  function setupStock() {
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
      return item.quantity > 0 && item.lot.uuid;
    });

    vm.validForSubmit = (lotsExists && vm.Stock.store.data.length);
  }

  // ================================= Submit ================================
  function submit(form) {
    let isExit;
    let fluxId;

    // check stock validity
    checkValidity();

    if (form.$invalid) { return 0; }

    if (!vm.validForSubmit || !vm.adjustmentOption) { return 0; }

    if (vm.Stock.hasDuplicatedLots()) {
      return Notify.danger('ERRORS.ER_DUPLICATED_LOT', 20000);
    }

    let description;

    if (vm.adjustmentOption === 'increase') {
      isExit = 0;
      fluxId = bhConstants.flux.FROM_ADJUSTMENT;
      description = $translate.instant('STOCK.ENTRY_ADJUSTMENT', {
        numArticles : vm.Stock.store.data.length,
        user : Session.user.display_name,
        depot : vm.depot.text,
      });
    } else if (vm.adjustmentOption === 'decrease') {
      isExit = 1;
      fluxId = bhConstants.flux.TO_ADJUSTMENT;
      description = $translate.instant('STOCK.EXIT_ADJUSTMENT', {
        numArticles : vm.Stock.store.data.length,
        user : Session.user.display_name,
        depot : vm.depot.text,
      });
    }

    const movement = {
      depot_uuid : vm.depot.uuid,
      entity_uuid : vm.movement.entity.uuid,
      date : vm.movement.date,
      description : description.concat(' -- ', vm.movement.description || ''),
      is_exit : isExit,
      flux_id : fluxId,
      user_id : Session.user.id,
    };

    const lots = vm.Stock.store.data.map((row) => {
      return {
        uuid : row.lot.uuid,
        quantity : row.quantity,
        unit_cost : row.lot.unit_cost,
        inventory_uuid : row.lot.inventory_uuid,
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

  startup();
}
