angular.module('bhima.controllers')
  .controller('StockEntryController', StockEntryController);

// dependencies injections
StockEntryController.$inject = [
  'DepotService', 'InventoryService', 'NotifyService', 'SessionService', 'util',
  'bhConstants', 'ReceiptModal', 'PurchaseOrderService', 'StockFormService',
  'StockService', 'StockModalService', 'uiGridConstants', 'Store', 'appcache',
  'uuid', '$translate',
];

/**
 * @class StockEntryController
 *
 * @description
 * This controller is responsible to handle stock entry module.
 */
function StockEntryController(
  Depots, Inventory, Notify, Session, util, bhConstants, ReceiptModal, Purchase,
  StockForm, Stock, StockModal, uiGridConstants, Store, AppCache, Uuid, $translate
) {
  // variables
  let inventoryStore;

  // constants
  const vm = this;
  const cache = new AppCache('StockCache');
  const mapEntry = initEntryMap();

  // view models variables and methods
  vm.stockForm = new StockForm('StockEntry');
  vm.maxLength = util.maxLength;
  vm.maxDate = new Date();
  vm.entryOption = false;
  vm.resetEntryExitTypes = false;
  vm.enterprise = Session.enterprise;
  vm.movement = {};
  vm.addItems = addItems;
  vm.removeItem = removeItem;
  vm.selectEntryType = selectEntryType;
  vm.setInitialized = setInitialized;
  vm.buildStockLine = buildStockLine;
  vm.setLots = setLots;
  vm.submit = submit;
  vm.changeDepot = changeDepot;
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

  /**
   * @function initEntryMap
   * @description return an object map for the mapEntry constant
   */
  function initEntryMap() {
    return {
      purchase : { find : findPurchase, submit : submitPurchase },
      donation : { find : handleDonationSelection, submit : submitDonation },
      integration : { find : handleIntegrationSelection, submit : submitIntegration },
      transfer_reception : { find : findTransfer, submit : submitTransferReception },
    };
  }

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
  function reset(form = mapEntry.form) {
    vm.stockForm.store.clear();
    form.$setPristine();
    form.$setUntouched();
    vm.movement = { date : new Date() };
    vm.resetEntryExitTypes = true;
  }

  /**
   * @method selectEntryType
   * @param {object} entryType
   * @description called when an entry type is selected
   */
  function selectEntryType(entryType) {
    mapEntry[entryType.label].find();
    vm.movement.entry_type = entryType.label;
    vm.stockForm.store.clear();
    vm.resetEntryExitTypes = false;

    /**
     * if false, the bhAddItems will be deactived
     * the bhAddItems must be deactivated if no entity is selected
     * or if the selected entity is `purchase` or `transfer_reception`
     */
    vm.entityAllowAddItems = !!(vm.movement.entry_type)
      && (vm.movement.entry_type !== 'purchase' && vm.movement.entry_type !== 'transfer_reception');
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

    // make sure that the depot is loaded if it doesn't exist at startup.
    if (cache.depotUuid) {
      Depots.read(cache.depotUuid, { only_user : true })
        .then((depot) => {
          vm.depot = depot;
          setupStock();
        })
        .catch(Notify.handleError);
    } else {
      changeDepot().then(setupStock);
    }
  }

  /**
   * @method loadInventories
   * @description load consumable inventories
   */
  function loadInventories() {
    // by definition, an item is consumable if it is purchasable because it can finish or be full used (amorti)
    // an aspirin or a pen are both consumable because they can be purchased
    // we will load only purchasable items
    Inventory.read(null, { consumable : 1 })
      .then((inventories) => {
        vm.inventories = inventories;
        inventoryStore = new Store({ identifier : 'uuid', data : inventories });
      })
      .catch(Notify.handleError);
  }

  /**
   * @method resetSelectedEntity
   * @description
   * reset the selected entity (purchase | integration | donation | transfer)
   * variables and properties
   */
  function resetSelectedEntity() {
    vm.movement.entity = {};
    vm.movement.entry_type = null;
    vm.movement.description = null;
    vm.reference = null;
    vm.displayName = null;
    vm.resetEntryExitTypes = true;
  }

  /**
   * @method handleSelectedEntity
   * @param {object} _entities
   * @param {object} _type
   * @description
   * set movement information according the selected entity and populate the grid
   */
  function handleSelectedEntity(_entities, _type) {
    if (!_entities || !_entities.length) {
      resetSelectedEntity();
      return;
    }

    vm.movement.entity = {
      uuid : _entities[0].uuid,
      type : _type,
      instance : _entities[0],
    };

    // set the description
    setDescription(vm.movement.entity);

    // populate the grid
    populate(_entities);
  }

  /**
   * @method setDescription
   * @param {object} entity
   * @description set the description of the movement
   */
  function setDescription(entity) {
    const map = {
      purchase : 'STOCK.PURCHASE_DESCRIPTION',
      donation : 'STOCK.RECEPTION_DONATION',
      integration : 'STOCK.RECEPTION_INTEGRATION',
      transfer_reception : 'STOCK.RECEPTION_DESCRIPTION',
    };

    if (!entity || !entity.uuid) { return; }

    const description = $translate.instant(map[entity.type], {
      supplier : entity.instance.supplier_name,
      purchase_order : entity.instance.reference,
    });

    vm.movement.description = description;
  }

  /**
   * @method findPurchase
   * @description pop up  a modal to let user find a purchase order
   */
  function findPurchase() {
    StockModal.openFindPurchase()
      .then((purchase) => {
        handleSelectedEntity(purchase, 'purchase');
        setSelectedEntity(vm.movement.entity.instance);
      })
      .catch(Notify.handleError);
  }

  /**
   * @method findTransfer
   * @description pop up  a modal to let user find a transfer to receive
   */
  function findTransfer() {
    StockModal.openFindTansfer({ depot_uuid : vm.depot.uuid })
      .then((transfers) => {
        handleSelectedEntity(transfers, 'transfer_reception');
        setSelectedEntity(vm.movement.entity.instance);
        vm.hasValidInput = hasValidInput();
      })
      .catch(Notify.handleError);
  }

  /**
   * @method handleIntegrationSelection
   * @description reset the form for a new integration entry
   */
  function handleIntegrationSelection() {
    const description = $translate.instant('STOCK.RECEPTION_INTEGRATION');
    initSelectedEntity(description);
    if (vm.gridOptions.data.length === 0) {
      vm.addItems(1);
    }
  }

  /**
   * @method handleDonationSelection
   * @description reset the form for a new donation entry
   */
  function handleDonationSelection() {
    const description = $translate.instant('STOCK.RECEPTION_DONATION');
    initSelectedEntity(description);
    if (vm.gridOptions.data.length === 0) {
      vm.addItems(1);
    }
  }

  /**
   * @method populate
   * @param {object} items
   * @description fill the grid with inventories contained in the purchase order or transfer
   */
  function populate(items) {
    if (!items.length) { return; }

    // clear the store before adding new items
    vm.stockForm.store.clear();

    // adding items.length line in the stockForm store, which will be reflected to the grid
    vm.stockForm.addItems(items.length);

    vm.stockForm.store.data.forEach((item, index) => {
      const inventory = inventoryStore.get(items[index].inventory_uuid);

      item.code = inventory.code;
      item.inventory_uuid = inventory.uuid;
      item.label = inventory.label;
      item.unit_cost = items[index].unit_price || items[index].unit_cost; // transfer comes with unit_cost
      item.quantity = items[index].balance || items[index].quantity;
      item.cost = item.quantity * item.unit_cost;
      item.expiration_date = new Date();

      if (vm.movement.entity.type === 'transfer_reception') {
        item.lots.push({
          isValid : true,
          lot : items[index].label,
          quantity : item.quantity,
          expiration_date : new Date(items[index].expiration_date),
          uuid : items[index].uuid,
        });
      }

      setInitialized(item);
    });
  }

  /**
   * @method initSelectedEntity
   * @param {string} description
   * @description initialize description and label for the selected entity
   */
  function initSelectedEntity(description) {
    vm.displayName = '';
    vm.reference = '';
    vm.movement.description = description;
  }

  /**
   * @method setSelectedEntity
   * @param {entity} entity
   * @description set the label of the selected entity
   */
  function setSelectedEntity(entity) {
    if (!entity) { return; }

    const uniformEntity = Stock.uniformSelectedEntity(entity);
    vm.reference = entity.documentReference || uniformEntity.reference;
    vm.displayName = entity.depot_text || uniformEntity.displayName;
  }

  /**
   * @method setLots
   * @param {object} stockLine
   * @description [grid] pop up a modal for defining lots for each row in the grid
   */
  function setLots(stockLine) {
    // Additionnal information for an inventory Group
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
   * @method submit
   * @param {object} form
   * @description send data to the server for a stock entry
   */
  function submit(form) {
    if (form.$invalid) {
      return Notify.danger('FORM.ERRORS.INVALID');
    }

    if (!vm.movement.entry_type) {
      return Notify.danger('ERRORS.ER_NO_STOCK_SOURCE');
    }
    vm.$loading = true;
    mapEntry.form = form;
    return mapEntry[vm.movement.entry_type].submit()
      .then(toggleLoadingIndicator)
      .finally(() => vm.reset(form));
  }

  /**
   * @method toggleLoadingIndicator
   * @description toggle value for the loading indicator
   */
  function toggleLoadingIndicator() {
    vm.$loading = !vm.$loading;
  }

  /**
   * @method submitPurchase
   * @description prepare the stock movement and send data to the server as new entry from a purchase
   */
  function submitPurchase() {
    const movement = {
      depot_uuid  : vm.depot.uuid,
      entity_uuid : vm.movement.entity.uuid,
      date        : vm.movement.date,
      description : vm.movement.description,
      flux_id     : bhConstants.flux.FROM_PURCHASE,
      user_id     : vm.stockForm.details.user_id,
    };

    movement.lots = Stock.processLotsFromStore(vm.stockForm.store.data, vm.movement.entity.uuid);

    return Stock.stocks.create(movement)
      .then(document => {
        vm.document = document;
        return Purchase.stockStatus(vm.movement.entity.uuid);
      })
      .then(() => {
        vm.reset();
        ReceiptModal.stockEntryPurchaseReceipt(vm.document.uuid, bhConstants.flux.FROM_PURCHASE);
      })
      .catch(Notify.handleError);
  }


  /**
   * @method submitIntegration
   * @description prepare the stock movement and send data to the server as new stock integration
   */
  function submitIntegration() {
    const movement = {
      depot_uuid  : vm.depot.uuid,
      entity_uuid : null,
      date        : vm.movement.date,
      description : vm.movement.description,
      flux_id     : bhConstants.flux.FROM_INTEGRATION,
      user_id     : vm.stockForm.details.user_id,
    };

    const entry = {
      lots : Stock.processLotsFromStore(vm.stockForm.store.data, movement.entity_uuid),
      movement,
    };

    return Stock.integration.create(entry)
      .then(document => {
        vm.reset();
        ReceiptModal.stockEntryIntegrationReceipt(document.uuid, bhConstants.flux.FROM_INTEGRATION);
      })
      .catch(Notify.handleError);
  }

  /**
   * @method submitDonation
   * @description prepare the stock movement and send data to the server as new stock donation
   */
  function submitDonation() {
    const movement = {
      depot_uuid  : vm.depot.uuid,
      entity_uuid : null,
      date        : vm.movement.date,
      description : vm.movement.description,
      flux_id     : bhConstants.flux.FROM_DONATION,
      user_id     : vm.stockForm.details.user_id,
    };

    /*
      the origin_uuid of lots is set on the client
      because donation table depends on donor, and donor management
      is not yet implemented in the application

      TODO: add a donor management module
    */
    movement.lots = Stock.processLotsFromStore(vm.stockForm.store.data, Uuid());

    return Stock.stocks.create(movement)
      .then((document) => {
        vm.reset();
        ReceiptModal.stockEntryDonationReceipt(document.uuid, bhConstants.flux.FROM_DONATION);
      })
      .catch(Notify.handleError);
  }

  /**
   * @method submitTransferReception
   * @description prepare the stock movement and send data to the server as new stock reception of transfer
   */
  function submitTransferReception() {
    const movement = {
      from_depot    : vm.movement.entity.instance.depot_uuid,
      to_depot      : vm.depot.uuid,
      document_uuid : vm.movement.entity.instance.document_uuid,
      date          : vm.movement.date,
      description   : vm.movement.description,
      isExit        : false,
      user_id       : vm.stockForm.details.user_id,
    };

    movement.lots = Stock.processLotsFromStore(vm.stockForm.store.data, null);

    return Stock.movements.create(movement)
      .then((document) => {
        vm.reset();
        ReceiptModal.stockEntryDepotReceipt(document.uuid, true);
      })
      .catch(Notify.handleError);
  }

  /**
   * @method changeDepot
   * @description pop up a modal for selecting a depot
   */
  function changeDepot() {
    // if there is not cached depot, the modal will require to select a depot
    const requirement = !cache.depotUuid;
    return Depots.openSelectionModal(vm.depot, requirement)
      .then((depot) => {
        vm.depot = depot;
        cache.depotUuid = vm.depot.uuid;
      });
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
    setInitialized(line);
  }

  startup();
}
