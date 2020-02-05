angular.module('bhima.controllers')
  .controller('StockInventoryAdjustmentController', StockInventoryAdjustmentController);

// dependencies injections
StockInventoryAdjustmentController.$inject = [
  'InventoryService', 'NotifyService', 'SessionService', 'util',
  'StockFormService', 'StockModalService', 'uiGridConstants', 'Store',
];

/**
 * @class StockInventoryAdjustmentController
 *
 * @description
 * This controller is responsible to handle stock inventory adjustment
 */
function StockInventoryAdjustmentController(
  Inventory, Notify, Session, util,
  StockForm, StockModal, uiGridConstants, Store,
) {
  // variables
  let inventoryStore;

  // constants
  const vm = this;

  // view models variables and methods
  vm.stockForm = new StockForm('StockInventoryAdjustment');
  vm.maxLength = util.maxLength;
  vm.maxDate = new Date();
  vm.entryOption = false;
  vm.resetEntryExitTypes = false;
  vm.enterprise = Session.enterprise;
  vm.movement = {};
  vm.addItems = addItems;
  vm.removeItem = removeItem;
  vm.setInitialized = setInitialized;
  vm.buildStockLine = buildStockLine;
  vm.setLots = setLots;
  // vm.submit = submit;
  vm.reset = reset;
  vm.onDateChange = onDateChange;

  vm.gridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    enableColumnMenus : false,
    columnDefs : [
      {
        field : 'status',
        width : 25,
        displayName : '',
        cellTemplate : 'modules/stock/entry/templates/status.tmpl.html',
      },

      {
        field : 'code',
        width : 120,
        displayName : 'TABLE.COLUMNS.CODE',
        headerCellFilter : 'translate',
        cellTemplate : 'modules/stock/entry/templates/code.tmpl.html',
      },

      {
        field : 'description',
        displayName : 'TABLE.COLUMNS.DESCRIPTION',
        headerCellFilter : 'translate',
        cellTemplate : 'modules/stock/entry/templates/description.tmpl.html',
      },

      {
        field : 'unit',
        width : 150,
        displayName : 'TABLE.COLUMNS.UNIT',
        headerCellFilter : 'translate',
      },

      {
        field : 'lot',
        width : 150,
        displayName : 'TABLE.COLUMNS.LOT',
        headerCellFilter : 'translate',
        cellTemplate : 'modules/stock/entry/templates/lot.tmpl.html',
      },

      {
        field : 'quantity',
        width : 150,
        displayName : 'TABLE.COLUMNS.QUANTITY',
        headerCellFilter : 'translate',
        cellTemplate : 'modules/stock/entry/templates/quantity.tmpl.html',
        aggregationType : uiGridConstants.aggregationTypes.sum,
      },

      {
        field : 'actions',
        width : 25,
        cellTemplate : 'modules/stock/entry/templates/actions.tmpl.html',
      },
    ],
    data : vm.stockForm.store.data,
    fastWatch : true,
    flatEntityAccess : true,
  };

  // on change depot
  vm.onChangeDepot = depot => {
    vm.depot = depot;
    loadInventories();
  };

  /**
   * @method onDateChange
   * @param {date} date
   * @description on change in bhDateEditor component update the date
   */
  function onDateChange(date) {
    vm.movement.date = date;
  }

  /**
   * @method reset
   * @param {object} form
   * @description reset the form after submission or on clear
   */
  function reset(form) {
    vm.stockForm.store.clear();
    form.$setPristine();
    form.$setUntouched();
    vm.movement = { date : new Date() };
  }

  /**
   * @method setInitialized
   * @param {object} item
   * @description [grid] set initialized to true on the passed item
   */
  function setInitialized(item) {
    item._initialised = true;
  }

  /**
   * @method addItems
   * @param {number} n
   * @description [grid] add n items (rows) in the grid and call a validation function on each rows
   */
  function addItems(n) {
    vm.stockForm.addItems(n);
    vm.hasValidInput = hasValidInput();
  }

  /**
   * @method removeItem
   * @param {number} index
   * @description [grid] remove the row with the given index and call a validation function on each remaining rows
   */
  function removeItem(index) {
    vm.stockForm.removeItem(index);
    vm.hasValidInput = hasValidInput();
  }

  /**
   * @method setupStock
   * @description [grid] setup the grid and clear all previous values
   */
  function setupStock() {
    vm.stockForm.setup();
    vm.stockForm.store.clear();
  }

  /**
   * @method startup
   * @description
   * The first function to be called, it init :
   * - A list of inventories
   * - An object dor a movement
   * - A depot from the cache or give possiblity of choosing one if not set
   */
  function startup() {
    // init a movement object
    vm.movement = {
      date : new Date(),
      entity : {},
    };

    // loading all purchasable inventories
    loadInventories();
  }

  /**
   * @method loadInventories
   * @description load inventories
   */
  function loadInventories() {
    setupStock();

    Inventory.read()
      .then((inventories) => {
        vm.inventories = inventories;
        inventoryStore = new Store({ identifier : 'uuid', data : inventories });
      })
      .catch(Notify.handleError);
  }


  /**
   * @method setLots
   * @param {object} stockLine
   * @description [grid] pop up a modal for defining lots for each row in the grid
   */
  function setLots(stockLine) {
    const inventory = inventoryStore.get(stockLine.inventory_uuid);
    stockLine.expires = inventory.expires;
    stockLine.unique_item = inventory.unique_item;

    StockModal.openDefineLots({
      stockLine,
      entry_type : vm.movement.entry_type,
    })
      .then((res) => {
        if (!res) { return; }
        stockLine.lots = res.lots;
        stockLine.quantity = res.quantity;
        stockLine.unit_cost = res.unit_cost; // integration and donation price is defined in the lot modal
        vm.hasValidInput = hasValidInput();
      })
      .catch(Notify.handleError);
  }

  /**
   * @function hasValidInput
   * @description [grid] check if all rows in the grid have lots defined
   */
  function hasValidInput() {
    return vm.stockForm.store.data.every(line => line.lots.length > 0);
  }


  /**
   * @method buildStockLine
   * @param {object} line
   * @description [grid] initialize each cell of defined rows with value
   */
  function buildStockLine(line) {
    const inventory = inventoryStore.get(line.inventory_uuid);
    line.code = inventory.code;
    line.label = inventory.label;
    line.unit_cost = inventory.price;
    line.quantity = 0;
    line.cost = line.quantity * line.unit_cost;
    line.expiration_date = new Date();
    line.unit = inventory.unit;
    setInitialized(line);
  }

  startup();
}
