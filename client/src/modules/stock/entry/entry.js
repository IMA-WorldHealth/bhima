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
  var vm = this;
  var inventoryStore;
  var mapEntry;
  var gridOptions;
  var cache = new AppCache('StockEntry');

  vm.stockForm = new StockForm('StockEntry');
  vm.movement = {};

  // exposing some properties to the view
  vm.itemIncrement = 1;
  vm.enterprise = Session.enterprise;
  vm.maxLength = util.maxLength;
  vm.maxDate = new Date();
  vm.entryOption = false;

  // exposing some methods to the view
  vm.addItems = addItems;
  vm.removeItem = removeItem;
  vm.selectEntryType = selectEntryType;
  vm.setInitialized = setInitialized;
  vm.buildStockLine = buildStockLine;
  vm.setLots = setLots;
  vm.submit = submit;
  vm.changeDepot = changeDepot;

  mapEntry = {
    purchase : { find : findPurchase, submit : submitPurchase },
    donation : { find : handleDonationSelection, submit : submitDonation },
    integration : { find : handleIntegrationSelection, submit : submitIntegration },
    transfer_reception : { find : findTransfer, submit : submitTransferReception },
  };

  gridOptions = {
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

  // exposing the grid options to the view
  vm.gridOptions = gridOptions;

  function selectEntryType(entryType) {
    vm.movement.entry_type = entryType.label;
    mapEntry[entryType.label].find();

    vm.entryOption = entryType && entryType.label !== 'purchase';
  }

  // set initialized to true on the passed item
  function setInitialized(item) {
    item._initialised = true;
  }

  function addItems(n) {
    vm.stockForm.addItems(n);
    hasValidInput();
  }

  function removeItem(index) {
    vm.stockForm.removeItem(index);
    hasValidInput();
  }

  function setupStock() {
    vm.stockForm.setup();
    vm.stockForm.store.clear();
  }

  /**
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
      Depots.read(cache.depotUuid)
        .then(function assignDepot(depot) {
          vm.depot = depot;
          setupStock();
        });
    } else {
      changeDepot().then(setupStock);
    }
  }

  function loadInventories() {
    // by definition, an item is consumable if it is purchasable because it can finish or be full used (amorti)
    // an aspirin or a pen are both consumable because they can be purchased
    // we will load only purchasable items

    Inventory.read(null, { consumable : 1 })
      .then(function assignInventories(inventories) {
        vm.inventories = inventories;
        inventoryStore = new Store({ identifier : 'uuid', data : inventories });
      })
      .catch(Notify.handleError);
  }

  function resetSelectedEntity() {
    vm.movement.entity = {};
    vm.movement.entry_type = null;
    vm.movement.description = null;
    vm.reference = null;
    vm.displayName = null;
  }

  function handleSelectedEntity(_entities, _type) {
    if (!_entities || !_entities.length) {
      resetSelectedEntity();
      return;
    }

    vm.movement.entity = {
      uuid : _entities[0].uuid,
      type : _type,
      instance : _entities[0], // just to get common information in every purchase
    };

    populate(_entities);
  }

  // pop up  a modal to let user find a purchase order
  function findPurchase() {
    var description = $translate.instant('STOCK.PURCHASE_DESCRIPTION');
    initSelectedEntity(description);

    StockModal.openFindPurchase()
      .then(function handlePurchase(purchase) {
        handleSelectedEntity(purchase, 'purchase');
        setSelectedEntity(vm.movement.entity.instance);
      })
      .catch(Notify.handleError);
  }

  // find transfer
  function findTransfer() {
    var description = $translate.instant('STOCK.RECEPTION_DESCRIPTION');
    initSelectedEntity(description);

    StockModal.openFindTansfer({ depot_uuid : vm.depot.uuid })
      .then(function handleTransfer(transfers) {
        if (!transfers) {
          resetSelectedEntity();
          return;
        }

        handleSelectedEntity(transfers, 'transfer_reception');
        vm.reference = transfers[0].documentReference;
        vm.hasValidInput = hasValidInput();
      })
      .catch(Notify.handleError);
  }

  function handleIntegrationSelection() {
    var description = $translate.instant('STOCK.RECEPTION_INTEGRATION');
    initSelectedEntity(description);
  }

  function handleDonationSelection() {
    var description = $translate.instant('STOCK.RECEPTION_DONATION');
    initSelectedEntity(description);
  }

  // fill the grid with the inventory contained in the purchase order
  function populate(items) {
    if (!items.length) { return; }

    // clear the store before adding new items
    vm.stockForm.store.clear();

    // adding items.length line in the stockForm store, which will be reflected to the grid
    vm.stockForm.addItems(items.length);

    vm.stockForm.store.data.forEach(function handleStockStoreData(item, index) {
      var inventory = inventoryStore.get(items[index].inventory_uuid);

      item.code = inventory.code;
      item.inventory_uuid = inventory.uuid;
      item.label = inventory.label;
      item.unit_cost = items[index].unit_price || items[index].unit_cost; // transfer comes with unit_cost
      item.quantity = items[index].quantity;
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

  function initSelectedEntity(description) {
    vm.displayName = '';
    vm.reference = '';
    vm.movement.description = description;
  }

  function setSelectedEntity(entity) {
    var uniformEntity = Stock.uniformSelectedEntity(entity);
    vm.reference = uniformEntity.reference;
    vm.displayName = uniformEntity.displayName;
  }

  function setLots(stockLine) {
    // Additionnal information for an inventory Group
    var inventory = inventoryStore.get(stockLine.inventory_uuid);
    stockLine.expires = inventory.expires;
    stockLine.unique_item = inventory.unique_item;

    StockModal.openDefineLots({
      stockLine : stockLine,
      entry_type : vm.movement.entry_type,
    })
      .then(function handleStockLots(res) {
        if (!res) { return; }
        stockLine.lots = res.lots;
        stockLine.givenQuantity = res.quantity;
        vm.hasValidInput = hasValidInput();
      })
      .catch(Notify.handleError);
  }

  // validation
  function hasValidInput() {
    return vm.stockForm.store.data.every(function checkLot(line) {
      return line.lots.length > 0;
    });
  }

  function submit(form) {
    if (form.$invalid) { return null; }

    if (!vm.movement.entry_type) {
      return Notify.danger('ERRORS.ER_NO_STOCK_SOURCE');
    }

    return mapEntry[vm.movement.entry_type].submit();
  }

  function submitPurchase() {
    var movement = {
      depot_uuid : vm.depot.uuid,
      entity_uuid : vm.movement.entity.uuid,
      date : vm.movement.date,
      description : vm.movement.description,
      flux_id : bhConstants.flux.FROM_PURCHASE,
      user_id : vm.stockForm.details.user_id,
    };

    movement.lots = Stock.processLotsFromStore(vm.stockForm.store.data, vm.movement.entity.uuid);

    Stock.stocks.create(movement)
      .then(function updatePurchaseStatus(document) {
        vm.document = document;
        return Purchase.stockStatus(vm.movement.entity.uuid);
      })
      .then(function handleReceipt() {
        vm.stockForm.store.clear();
        vm.movement = {};
        ReceiptModal.stockEntryPurchaseReceipt(vm.document.uuid, bhConstants.flux.FROM_PURCHASE);
      })
      .catch(Notify.handleError);
  }


  function submitIntegration() {
    var movement = {
      depot_uuid : vm.depot.uuid,
      entity_uuid : null,
      date : vm.movement.date,
      description : vm.movement.description,
      flux_id : bhConstants.flux.FROM_INTEGRATION,
      user_id : vm.stockForm.details.user_id,
    };

    var entry = {
      lots : Stock.processLotsFromStore(vm.stockForm.store.data, movement.entity_uuid),
      movement : movement,
    };

    Stock.integration.create(entry)
      .then(function handleReceipt(document) {
        vm.stockForm.store.clear();
        vm.movement = {};
        ReceiptModal.stockEntryIntegrationReceipt(document.uuid, bhConstants.flux.FROM_INTEGRATION);
      })
      .catch(Notify.handleError);
  }

  function submitDonation() {
    var movement = {
      depot_uuid : vm.depot.uuid,
      entity_uuid : null,
      date : vm.movement.date,
      description : vm.movement.description,
      flux_id : bhConstants.flux.FROM_DONATION,
      user_id : vm.stockForm.details.user_id,
    };

    /*
      the origin_uuid of lots is set on the client
      because donation table depends on donor, and donor management
      is not yet implemented in the application

      TODO: add a donor management module
    */
    movement.lots = Stock.processLotsFromStore(vm.stockForm.store.data, Uuid());

    return Stock.stocks.create(movement)
      .then(function handleReceipt(document) {
        vm.stockForm.store.clear();
        vm.movement = {};
        ReceiptModal.stockEntryDonationReceipt(document.uuid, bhConstants.flux.FROM_DONATION);
      })
      .catch(Notify.handleError);
  }

  // submit transfer reception
  function submitTransferReception() {
    var movement = {
      from_depot : vm.movement.entity.instance.depot_uuid,
      to_depot : vm.depot.uuid,
      document_uuid : vm.movement.entity.instance.document_uuid,
      date : vm.movement.date,
      description : vm.movement.description,
      isExit : false,
      user_id : vm.stockForm.details.user_id,
    };

    movement.lots = Stock.processLotsFromStore(vm.stockForm.store.data, null);

    return Stock.movements.create(movement)
      .then(function handleReceipt(document) {
        vm.stockForm.store.clear();
        vm.movement = {};
        ReceiptModal.stockEntryDepotReceipt(document.uuid, true);
      })
      .catch(Notify.handleError);
  }

  function changeDepot() {
    return Depots.openSelectionModal(vm.depot)
      .then(function handleDepotSwitch(depot) {
        vm.depot = depot;
        cache.depotUuid = vm.depot.uuid;
      });
  }

  function buildStockLine(line) {
    var inventory = inventoryStore.get(line.inventory_uuid);
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
