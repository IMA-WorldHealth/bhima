angular.module('bhima.services')
  .service('InvoiceItems', InvoiceItemsService);

InvoiceItemsService.$inject = [
  'InventoryService', 'Store', 'AppCache', 'PatientInvoiceItemService', 'PoolStore'
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
 * @todo refactor API/rename methods
 * @todo (required) all percentages/value manipulations should be rounded to a standard (or done at total calculation)
 * @todo (required) Service was designed to download inventory items at the service level and return items instance using this (move intentory loading out of instance)
 *
 * @module services/InvoiceItems
 */
function InvoiceItemsService(InventoryService, Store, AppCache, PatientInvoiceItem, PoolStore) {

  function InvoiceItems(cacheKey) {
    var items = this;

    if (!cacheKey) {
      throw new Error(
        'Expected InvoiceItems service to implement a cacheKey, but it was not provided.'
      );
    }

    var appcache = AppCache(cacheKey);

    var initialItem = false;
    var priceList = null;

    // state variables
    items.recovered = false;
    items.cacheAvailable = false;
    items.invalid = false;

    // track if the server has returned all of the available inventory items
    items.inventoryLoaded = false;

    // stores
    items.inventoryItems = new PoolStore({ identifier : 'uuid', data: [] });
    items.currentRows = new Store({ identifier : 'uuid', data: [] });

    /**
     * Methods for manipulating rows
     */
    function addItems(totalItems) {
      totalItems = totalItems || 1;
      while (totalItems--) {
        addItem();
      }
    }

    // remove the entity from the current list of sale items
    function removeItem(item) {
      items.currentRows.remove(item.uuid);
      items.inventoryItems.free(item.inventory_uuid);
    }

    function configureItem(item) {
      // remove item from being able to be selected an additional time
      var inventoryItem = items.inventoryItems.use(item.inventory_uuid);

      // configure the item with the inventory item's properties
      item.configure(inventoryItem);

      // override the empty item with a new PatientInvoiceItem
      applyPriceList(item);
    }

    function allAssigned() {
      return items.currentRows.data.length === items.inventoryItems.size();
    }

    function setPriceList(priceList) {
      items.priceList = new Store({identifier : 'inventory_uuid'});
      items.priceList.setData(priceList.items);
    }

    function applyPriceList(item) {

      if (angular.isDefined(items.priceList)) {
        var priceReference = items.priceList.get(item.inventory_uuid);

        if (angular.isDefined(priceReference)) {
          item._hasPriceList = true;

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

    // returns invalid items to be scrolled to
    function validate() {

      // filters out valid items
      var invalidItems = items.rows.filter(function (row) {
        row.validate();
        return row._invalid;
      });

      return invalidItems;
    }

    function sum() {
      return items.rows.reduce(function (aggregate, row) {
        row.validate();

        // only sum valid rows
        if (row._valid) {
          row.credit = (row.quantity * row.transaction_price);
          return aggregate + row.credit;
        } else {
          return aggregate;
        }
      }, 0);
    }

    function clear() {
      items.currentRows.data.forEach(function (item) {
         items.removeItem(item);
      });
    }


    // adds an empty shell of an item to the invoice, this will later
    // be replaced with an instance of PatientInvoiceItem.  It allows
    // a blank row to be created in the grid though.
    function addItem() {

     // only add sale items if there are possible inventory item options
      if (allAssigned()) { return; }

      // create a new patient invoice item and add it to the store
      var item = new PatientInvoiceItem();
      items.currentRows.post(item);
    }

    InventoryService.getInventoryItems()
      .then(function (data) {
        items.inventoryItems.initialize('uuid', data);
        items.inventoryLoaded = true;
      });

    // Alias currentRows.data as this is used frequently
    items.rows = items.currentRows.data;

    items.addItems = addItems;
    items.removeItem = removeItem;
    items.configureItem = configureItem;
    items.allAssigned = allAssigned;
    items.clear = clear;

    items.setPriceList = setPriceList;
    items.validate = validate;
    items.sum = sum;
  }

  return InvoiceItems;
}
