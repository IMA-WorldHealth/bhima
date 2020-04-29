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
  vm.configureItem = configureItem;
  vm.checkValidity = checkValidity;
  vm.submit = submit;
  vm.selectedLots = [];

  // grid columns
  const columns = [
    {
      field : 'status',
      width : 25,
      displayName : '',
      cellTemplate : 'modules/stock/exit/templates/status.tmpl.html',
      enableFiltering : false,
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
      enableSorting : true,
    },

    {
      field : 'label',
      width : 150,
      displayName : 'TABLE.COLUMNS.LOT',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/inventory-adjustment/templates/lot.tmpl.html',
      enableSorting : true,
    },

    {
      field : 'available_lot',
      width : 150,
      displayName : 'INVENTORY_ADJUSTMENT.OLD_QUANTITY',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/exit/templates/available.tmpl.html',
      enableFiltering : false,
    },

    {
      field : 'quantity',
      width : 180,
      displayName : 'INVENTORY_ADJUSTMENT.NEW_QUANTITY',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/inventory-adjustment/templates/quantity.tmpl.html',
      aggregationType : uiGridConstants.aggregationTypes.sum,
      enableFiltering : false,
    },

    {
      field : 'expiration_date',
      width : 150,
      displayName : 'TABLE.COLUMNS.EXPIRATION_DATE',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/exit/templates/expiration.tmpl.html',
      enableFiltering : false,
    },
  ];

  // grid options
  vm.gridOptions = {
    appScopeProvider : vm,
    enableSorting : true,
    enableColumnMenus : false,
    columnDefs : columns,
    data : vm.Stock.store.data,
    fastWatch : true,
    flatEntityAccess : true,
    rowTemplate : 'modules/templates/grid/error.row.html',
    onRegisterApi : onRegisterApiFn,
  };

  // register api
  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  // inline filter
  vm.toggleInlineFilter = () => {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };

  // add items
  function addItems(n) {
    vm.Stock.addItems(n);
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
    vm.loading = true;
    setupStock();

    Stock.lots.read(null, {
      depot_uuid : depot.uuid,
      includeEmptyLot : 0,
      dateTo : vm.movement.date,
    })
      .then(lots => {
        addItems(lots.length);
        vm.Stock.store.data.forEach((item, index) => {
          const lot = lots[index];
          item.inventory = {
            inventory_uuid : lot.inventory_uuid,
            text : lot.text,
            code : lot.code,
          };
          item.lot = lot;
          item.quantity = lot.quantity;
          // added for sorting on these columns
          item.code = lot.code;
          item.description = lot.text;
          item.label = lot.label;
          // set item lots details
          configureItem(item);
        });
        checkValidity();
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  // check validity
  function checkValidity() {
    const lotsExists = vm.Stock.hasValidLots();

    vm.validForSubmit = (lotsExists && vm.Stock.store.data.length);
  }

  // ================================= Submit ================================
  function submit(form) {
    // check stock validity
    checkValidity();

    if (!vm.validForSubmit || form.$invalid) { return 0; }

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
      out.oldQuantity = out.quantity;
      out.quantity = row.quantity;
      return out;
    });

    movement.lots = lots.filter(lot => {
      return lot.quantity !== lot.oldQuantity;
    });

    if (!movement.lots.length) {
      Notify.warn('INVENTORY_ADJUSTMENT.NO_CHANGE');
      return 0;
    }

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
