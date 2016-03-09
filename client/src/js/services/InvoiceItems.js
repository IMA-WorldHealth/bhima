angular.module('bhima.services')
  .service('InvoiceItems', InvoiceItems);

InvoiceItems.$inject = [
  'InventoryService', 'uuid', 'store', 'AppCache'
];

/**
 * Invoice Items Service
 *
 * Item cache is currently only a prototype, a researched set of rules should be
 * implemented depending on users requirements, currently the cache works as follows:
 * - The first item confirmed determines the new cache to track
 * - If recovered anything added to the old cache will also be tracked
 * - Once recovered items cannot be recovered again
 * - Clearing an invoice will maintain the cache

 * @todo (required) cache methods should be removed into their own service
 * @todo (required) cache should be updated to use simpler browser cache vs. local forage - all steps significantly simplified
 * @todo refactor API/ rename methods
 * @todo (required) all percentages/value manipulations should be rounded to a standard (or done at total calculation)
 * @todo refactor validation
 * @todo (required) Service was designed to download inventory items at the service level and return items instance using this (move intentory loading out of instance)
 *
 * @module services/InvoiceItems
 */
function InvoiceItems(InventoryService, Uuid, Store, AppCache) {

  function ItemsModel(cacheKey) {
    var items = this;

    cacheKey = cacheKey || 'invoice_items_key';

    var appcache = AppCache(cacheKey);

    // options object for setting up stores
    var options  = { identifier : 'uuid' };

    var initialItem = false;
    var priceList = null;
    var totalInventoryItems = 0;

    // State variables
    items.recovered = false;
    items.cacheAvailable = false;
    items.invalid = false;

    // Track if the server has returned all of the available inventory items
    items.inventoryLoaded = false;

    // Stores
    items.inventoryItems = new Store(options);
    items.currentRows = new Store(options);
    items.currentRows.setData([]);

    /**
     * Methods for manipulating rows
     */
    function addInventoryItem(totalItems) {
      totalItems = totalItems || 1;

      for (var i = 0; i < totalItems; i++) {
        addItem();
      }
    }

    function removeItem(item, clearCache) {
      clearCache = angular.isDefined(clearCache) ? clearCache : true;

      // Remove the entity from the current list of sale items
      items.currentRows.remove(item.uuid);

      // If the item has had an inventory assigned to it, add this item back into the pool of available inventory items
      if (item.sourceInventoryItem) {
        items.inventoryItems.post(item.sourceInventoryItem);

        if (clearCache) {
          delete appcache[item.sourceInventoryItem];
        }
      }
    }

    function confirmItem(item) {
      var inventoryItem = items.inventoryItems.get(item.inventory_uuid);

      // Test for setting the first item in an invoice
      if (!initialItem) {

        // If the service hasn't been recovered - this is now the new cache standard
        if (!items.recovered) {
          removeCache();
        }
        initialItem = true;
      }
      applyPriceList(item);

      // Settup item variables
      item.confirmed = true;
      item.quantity = 1;
      item.transaction_price = inventoryItem.price;
      item.inventory_price = inventoryItem.price;
      item.code = inventoryItem.code;
      item.description = inventoryItem.label;

      // Track inventory item in case this entity is removed and the item should be available for re-uese
      item.sourceInventoryItem = inventoryItem;

      // Remove item from being able to be selected an additional time
      items.inventoryItems.remove(item.inventory_uuid);

      // Write this item to be recovered by the cache
      appcache[inventoryItem.uuid] =  { confirmed : true };
    }

    /**
     * @param removeConfirmed {Boolean} Remove items even if they are confirmed, a value of false will respect confirm items
     * @param clearCache {Boolean} Clear cache as items are removed from current rows
     */
    function clearItems(removeConfirmed, clearCache) {
      var numberOfItems = items.rows.length;

      removeConfirmed = angular.isDefined(removeConfirmed) ? removeConfirmed : true;
      clearCache = angular.isDefined(clearCache) ? clearCache : true;

      for (var i = 0; i < numberOfItems; i++) {
        var item = items.currentRows.data[0];

        // Do not remove items if they are confirmed
        if (!removeConfirmed && item.confirmed) {
          return;
        }

        removeItem(item, clearCache);
      }
    }

    function allAssigned() {
      return items.currentRows.data.length === totalInventoryItems;
    }

    /**
     * methods for handling row cache
     * @todo This should be moved to another service
     */
    function removeCache() {
      items.cacheAvailable = false;

      // fetch everything to make sure our cache isn't out of date (with the latest session)
      Object.keys(appcache).forEach(function (k) {
        delete appcache[k];
      });
    }

    function configureCachedItems(cachedItems) {
      var cacheFound = angular.isDefined(cachedItems) && cachedItems !== null;

      if (!cacheFound) { return; }

      items.recoveredCache = cachedItems;

      if (cachedItems.length > 0) {
        items.cacheAvailable = true;
      }
    }

    function recoverCache() {
      var cached = items.recoveredCache;
      items.recovered = true;

      // Remove any unconfirmed items - they will cause unexpected results
      // service.clearItems(false);
      clearItems(false);

      cached.forEach(function (item) {

        // verify that the item is not already confirmed
        var itemIsValid = items.inventoryItems.get(item.key);

        if (itemIsValid) {
          var placeholderItem = addItem();

          placeholderItem.inventory_uuid = item.key;
          // service.confirmItem(placeholderItem);
          confirmItem(placeholderItem);
        }
      });

      items.cacheAvailable = false;
    }

    // auxillary methods
    // configure base invoice item state - load single item and settup application cache
    function configureBase() {
      addItem();
      configureCachedItems(appcache.items);
    }

    function setPriceList(priceList) {
      items.priceList = new Store({identifier : 'inventory_uuid'});
      items.priceList.setData(priceList.items);
    }

    function applyPriceList(item) {

      if (angular.isDefined(items.priceList)) {
        var priceReference = items.priceList.get(item.inventory_uuid);

        if (angular.isDefined(priceReference)) {
          item.priceListApplied = true;

          if (priceReference.is_percentage) {

            // value is intended to manipulate line items base price
            item.transaction_price += (item.transaction_price / 100) * priceReference.value;
          } else {

            // value is intended to directly reflect line items price
            item.transaction_price = priceReference.value;
          }
        }
      }
    }

    function verify() {
      var invalidItem;

      items.rows.some(function (item) {
        var invalid = false;

        if (!item.confirmed) { invalid = true; }
        if (!angular.isNumber(item.quantity)) { invalid = true; }
        if (!angular.isNumber(item.transaction_price)) { invalid = true; }
        if (item.quantity <= 0) { invalid = true; }
        if (item.transaction_price < 0) { invalid = false; }

        if (invalid) {
          invalidItem = item;
          items.invalid = true;
          return true;
        }
      });

      items.invalid = false;

      return invalidItem;
    }

    function addItem() {

      // only add sale items if there are possible inventory item options
      if (!allAssigned()) {

        // TODO Dicuss - this could be a class if required standardised validation etc.
        var item = {
          confirmed : false,
          uuid : Uuid()
        };

        items.currentRows.post(item);
        return item;
      }
    }

    InventoryService.getInventoryItems()
      .then(function (result) {
        items.inventoryItems.setData(result);
        items.inventoryLoaded = true;
        totalInventoryItems = result.length;
      });

    // Alias currentRows.data as this is used frequently
    items.rows = items.currentRows.data;

    items.addInventoryItem = addInventoryItem;
    items.removeItem = removeItem;
    items.confirmItem = confirmItem;
    items.clearItems = clearItems;
    items.allAssigned = allAssigned;

    items.removeCache = removeCache;
    items.recoverCache = recoverCache;

    items.configureBase = configureBase;
    items.setPriceList = setPriceList;
    items.verify = verify;
  }

  return ItemsModel;
}
