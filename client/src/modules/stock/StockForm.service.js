angular.module('bhima.services')
  .service('StockFormService', StockFormService);

StockFormService.$inject = [
  'StockItemService', 'Store', 'AppCache', 'SessionService', '$timeout',
  'bhConstants',
];

/**
 * @class StockFormService
 *
 * @description
 * Provides utilities and functions for handling inventories and lots
 *
 * @todo - implement the cache feature
 */
function StockFormService(StockItem, Store, AppCache, Session, $timeout, bhConstants) {
  /**
   * @constructor
   */
  function StockForm(cacheKey) {
    if (!cacheKey) {
      throw new Error('StockForm expected a cacheKey, but it was not provided.');
    }

    this.cache = AppCache(cacheKey);
    this.details = {};
    this.store = new Store({ data : [] });
  }

  /**
   * @method setup
   *
   * @description
   * This function initializes the journal voucher form with data.  By default,
   * two lines are always present in the form.
   */
  StockForm.prototype.setup = function setup() {
    this.details = {
      date : new Date(),
      user_id : Session.user.id,
    };
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
    let elt;
    let i = n;

    // will repeat will n > 0
    while (i--) {
      elt = new StockItem();
      elt.id = this.store.data.length;
      this.store.post(elt);
    }

    return elt;
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

    $timeout(() => {
      this.setup();

      // validate() is only set up to test on submission as it checks the validity
      // of individual items which will not have been configured, manually
      // reset error state
      delete this._error;
    });
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
  StockForm.prototype.hasCacheAvailable = function hasCacheAvailable() {
    return Object.keys(this.cache).length > 0;
  };


  /**
   * @function errorLineHighlight
   *
   * @description
   * Sets the grid's error flag on the row to render a red highlight
   * on the row.
   *
   */
  function errorLineHighlight(rowIdx, store) {
    const { ROW_ERROR_FLAG } = bhConstants.grid;
    // set and unset error flag for allowing to highlight again the row
    // when the user click again on the submit button
    const row = store.data[rowIdx];
    row[ROW_ERROR_FLAG] = true;
    $timeout(() => {
      row[ROW_ERROR_FLAG] = false;
    }, 1000);
  }

  /**
   * @method hasDuplicatedLots
   *
   * @description
   * This method catch duplicated row and emit notification on the row
   */
  StockForm.prototype.hasDuplicatedLots = function hasDuplicatedLots() {
    let doublonDetectedLine;

    if (findDuplicatedLots(this.store)) {
      // notify on the concerned row
      errorLineHighlight(doublonDetectedLine, this.store);
      return true;
    }

    // update the list of selected lots
    function refreshSelectedLotsList(store) {
      return store.data
        .filter(item => item.lot && item.lot.uuid)
        .map(item => item.lot.uuid);
    }

    // detect the presence of duplicated lots
    function findDuplicatedLots(store) {
      let doubleIndex;
      const selectedLots = refreshSelectedLotsList(store);

      const doublonDetected = selectedLots.some((lot, idx) => {
        const hasDoubles = selectedLots.lastIndexOf(lot) !== idx;
        if (hasDoubles) { doubleIndex = idx; }
        return hasDoubles;
      });

      doublonDetectedLine = doubleIndex;
      return doublonDetected;
    }

    return false;
  };

  return StockForm;
}
