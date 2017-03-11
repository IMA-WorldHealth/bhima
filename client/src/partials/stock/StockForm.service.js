angular.module('bhima.services')
.service('StockFormService', StockFormService);

StockFormService.$inject = [
  'Store', 'AppCache', 'SessionService',
  '$timeout',
];

/**
 * @class StockFormService
 *
 * @description
 * Provides utilities and functions for handling inventories and lots
 *
 * @todo - implement the cache feature
 */
function StockFormService(Store, AppCache, Session, $timeout) {
  /**
   * @constructor
   */
  function StockForm(cacheKey) {
    if (!cacheKey) {
      throw new Error('StockForm expected a cacheKey, but it was not provided.');
    }

    this.cache = AppCache(cacheKey);
    this.details = {};
    this.store = new Store({ identifier: 'index', data: [] });
  }

  /**
   * @method setup
   *
   * @description
   * This function initializes the journal voucher form with data.  By default,
   * two lines are always present in the form.
   */
  StockForm.prototype.setup = function setup() {
    var self = this;
    self.details = {};
    self.details.date = new Date();
    self.details.user_id = Session.user.id;
  };

  /**
   * @method addItems
   *
   * @description
   * Adds an item to the grid.
   *
   * @param {Number} n - the number of items to add to the grid
   */
  StockForm.prototype.addItems = function addItems(n) {
    var elt;
    var idx;
    var self = this;
    while (n--) {
      elt = new StockItem();
      idx = self.store.data.length;
      elt.index = idx ? idx + 1 : idx;
      this.store.post(elt);
    }
  };

  /**
   * @method removeItem
   *
   * @description
   * This method removes an item from the ui-grid by its index.
   */
  StockForm.prototype.removeItem = function removeItem(index) {
    return this.store.remove(index);
  };

  /**
   * @method clear
   *
   * @description
   * This method clears the entire grid, removing all items from the grid.
   */
  StockForm.prototype.clear = function clear() {
    this.store.clear();

    $timeout(function () {
      this.setup();

      // validate() is only set up to test on submission as it checks the validity
      // of individual items which will not have been configured, manually
      // reset error state
      delete this._error;
    }.bind(this));
  };

  /**
   * @method writeCache
   *
   * @description
   * This method writes values from the movement into the application cache for
   * later recovery.
   */
  StockForm.prototype.writeCache = function writeCache() {
    this.cache.details = this.details;
    this.cache.items = angular.copy(this.store.data);
  };

  /**
   * @method clearCache
   *
   * @description
   * This method deletes the items from the application cache.
   */
  StockForm.prototype.clearCache = function clearCache() {
    delete this.cache.details;
    delete this.cache.items;
  };

  /**
   * @method hasCacheAvailable
   *
   * @description
   * Checks to see if the invoice has cached items to recover.
   */
  StockForm.prototype.hasCacheAvailable =  function hasCacheAvailable() {
    return Object.keys(this.cache).length > 0;
  };

  /**
   * @class StockItem
   */
  function StockItem() {
    var self = this;

    // index
    self.index = 0;

    // inventory
    self.inventory_uuid = null;
    self.code = null;
    self.text = null;

    // lot
    self.lot_uuid = null;
    self.label = null;
    self.quantity = 0;
    self.available = 0;
    self.unit_price = 0;
    self.amount = 0;
    self.expiration_date = null;

    // lots
    self.lots = [];

    // validation
    self.validation = function () {
      self.no_missing = self.inventory_uuid && self.lot_uuid &&
        self.quantity && self.expiration_date &&
        self.quantity <= self.available;
    };

    self.validation();
    return self;
  }

  return StockForm;
}
