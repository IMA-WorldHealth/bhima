angular.module('bhima.services')
.service('PurchaseOrderForm', PurchaseOrderFormService);

PurchaseOrderFormService.$inject = [
  'InventoryService', 'AppCache', 'Store', 'Pool', 'PurchaseOrderItemService'
];

/**
 * @class PurchaseOrderForm
 *
 * @description
 * The PurchaseOrderForm class manages the totalling, caching, and validation
 * associated with purchase order creation.  The developer must specify a cacheKey
 * to enable the class to be instantiated correctly.
 */
function PurchaseOrderFormService(Inventory, AppCache, Store, Pool, PurchaseOrderItem) {

  /**
   * @constructor
   *
   * @description
   * This function constructs a new instance of the PurchaseOrderForm class.
   *
   * @param {String} cacheKey - the AppCache key under which to store the
   *   order.
   */
  function PurchaseOrderForm(cacheKey) {

    if (!cacheKey) {
      throw new Error(
        'PurchaseOrderForm expected a cacheKey, but it was not provided.'
      );
    }

    // bind the cache key
    this.cache = AppCache(cacheKey);

    // set up the inventory
    // this will be referred to as PurchaseOrderForm.inventory.available.data
    this.inventory = new Pool({ identifier: 'uuid', data : [] });

    // set up the inventory
    Inventory.read()
      .then(function (data) {
        this.inventory.initialize('uuid', data);
      }.bind(this));

    // setup the rows of the grid as a store
    // this will be referred to as PurchaseOrderForm.store.data
    this.store = new Store({ identifier : 'uuid', data: [] });

    this.setup();
  }

  // initial setup and clearing of the order
  PurchaseOrderForm.prototype.setup = function setup() {

    // the order details
    this.details = {
      payment_method: 'FORM.LABELS.ON_DELIVERY',
      date: new Date(),
      cost: 0,
    };

    // the supplier is null
    this.supplier = null;

    // this object holds the totals for the order.
    this.totals = {
      rows : 0
    };

    // remove all items from the store as needed
    this.clear();

    this._valid = false ;
    this._invalid = true;

    // trigger a totals digest
    this.digest();
  };

  /**
   * @method validate
   *
   * @description
   * This method digests the order, then returns all invalid items in the
   * order to be dealt with by the user.
   */
  PurchaseOrderForm.prototype.validate = function validate() {
    this.digest();

    // filters out valid items
    var invalidItems = this.store.data.filter(function (row) {
      return row._invalid;
    });

    this._invalid = invalidItems.length > 0;
    this._valid = !this._invalid;

    return invalidItems;
  };


  /**
   * @method setSupplier
   *
   * @description
   * This allows the supplier to be cached locally and hooks up the creditor
   * uuid to the details form.
   *
   * @param {Object} supplier- a supplier selected by the purchasing
   *   module's typeahead
   */
  PurchaseOrderForm.prototype.setSupplier = function setSupplier(supplier) {
    var order = this;

    // attach the creditor uuid to the request
    order.details.supplier_uuid = supplier.uuid;

    // add a single item to the order to begin
    if (order.store.data.length === 0) {
      order.addItem();
    }

    // run validation and calculation
    order.digest();

  };

  /**
   * @method digest
   *
   * @description
   * Calculates the totals for the order by summing all the values in the grid.
   *
   * This method should be called anytime the values of the grid change, and on
   * setSupplier() completion.
   */
  PurchaseOrderForm.prototype.digest = function digest() {
    var order = this;
    var totals = order.totals;

    // loop through the items summing them into a total
    totals.rows = order.store.data.reduce(function (value, unit) {

      // compute validation
      unit.validate();

      // do not sum the row if the row is invalid
      if (unit._invalid) { return value; }

      unit.total = unit.unit_price * unit.quantity;
      return unit.total + value;
    }, 0);

    // bind the total as as the total cost
    order.details.cost = totals.rows;
  };

  // clears the store of items
  PurchaseOrderForm.prototype.clear = function clear() {
    var order = this;

    // copy the data so that forEach() doesn't get confused.
    var cp = angular.copy(order.store.data);

    // remove each item from the store
    cp.forEach(function (item) {
      order.removeItem(item);
    });
  };

  /*
   * PurchaseOrderForm Item Methods
   */

  /**
   * @method addItem
   *
   * @description
   * Adds a new PurchaseOrderItem to the store.  If the inventory is all used
   * up, return silently.  This is so that we do not add rows that cannot be
   * configured with inventory items.
   */
  PurchaseOrderForm.prototype.addItem = function addItem() {

    // we cannot insert more rows than our max inventory size
    var maxRows = this.inventory.size();
    if (this.store.data.length >= maxRows) {
      return;
    }

    // add the item to the store
    var item = new PurchaseOrderItem();
    this.store.post(item);

    // return a reference to the item
    return item;
  };

  /**
   * @method removeItem
   *
   * @description
   * Removes a specific item from the store. If the item has been configured,
   * also release the associated inventory item so that it may be used again.
   *
   * @param {Object} item - the item/row to be removed from the store
   */
  PurchaseOrderForm.prototype.removeItem = function removeItem(item) {
    this.store.remove(item.uuid);
    if (item.inventory_uuid) {
      this.inventory.release(item.inventory_uuid);
    }
  };

  /**
   * @method configureItem
   *
   * @description
   * New items still need to be configured with references to the inventory item
   * that is being orderd.  This method attaches the inventory_uuid to the
   * item, and removes the referenced inventory item from the pool.
   *
   * @param {Object} item - the item/row to be configured
   */
  PurchaseOrderForm.prototype.configureItem = function configureItem(item) {

    // remove the item from the pool
    var inventoryItem = this.inventory.use(item.inventory_uuid);

    // configure the PurchaseOrderFormItem with the inventory values
    item.configure(inventoryItem);

    // make sure to validate and calculate new totals
    this.digest();
  };


  /**
   * @method readCache
   *
   * @description
   * This method reads the values out of the application cache and into the
   * purchase order.  After reading the value, it re-digests the order to
   * perform validation and computer totals.
   */
  PurchaseOrderForm.prototype.readCache = function readCache() {

    // copy the cache temporarily
    var cp = angular.copy(this.cache);

    // set the details to the cached ones
    this.details = cp.details;

    // set the supplier
    this.setSupplier(cp.supplier);

    // setSupplier() adds an item.  Remove it before configuring data
    this.store.clear();

    // loop through the cached items, configuring them
    cp.items.forEach(function (cacheItem) {
      var item = this.addItem();
      item.inventory_uuid = cacheItem.inventory_uuid;
      this.configureItem(item);
    }.bind(this));

    // digest validation and totals
    this.digest();
  };

  /**
   * @method writeCache
   *
   * @description
   * This method writes values from the order into the application cache for
   * later recovery.
   */
  PurchaseOrderForm.prototype.writeCache = function writeCache() {
    this.cache.details = this.details;
    this.cache.supplier = this.supplier;
    this.cache.items = angular.copy(this.store.data);
  };

  /**
   * @method clearCache
   *
   * @description
   * This method deletes the items from the application cache.
   */
  PurchaseOrderForm.prototype.clearCache = function clearCache() {
    delete this.cache.details;
    delete this.cache.supplier;
    delete this.cache.items;
  };

  /**
   * @method hasCacheAvailable
   *
   * @description
   * Checks to see if the order has cached items to recover.
   */
  PurchaseOrderForm.prototype.hasCacheAvailable =  function hasCacheAvailable() {
    return Object.keys(this.cache).length > 0;
  };

  return PurchaseOrderForm;
}
